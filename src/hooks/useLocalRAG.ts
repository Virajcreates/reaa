import { useState, useCallback, useRef } from 'react';
import type { UploadedDocument, ProcessingProgress, DocumentSearchResult } from '@/types';
import { extractTextFromPDF, chunkText } from '@/utils/pdfParser';
import { generateEmbedding, generateEmbeddings, queryWithContext, generatePineconeEmbedding } from '@/utils/gemini';
import { insertChunks, searchSimilar, deleteDocuments } from '@/utils/supabaseClient';
import { searchPinecone } from '@/utils/pineconeClient';
import config from '@/config';

export function useLocalRAG(sessionId: string) {
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [processingProgress, setProcessingProgress] = useState<ProcessingProgress | null>(null);

  // Track if we're currently processing to prevent concurrent uploads
  const isProcessingRef = useRef(false);

  const hasDocuments = uploadedDocuments.some((doc) => doc.status === 'ready');
  const isProcessing = processingProgress !== null && processingProgress.stage !== 'done' && processingProgress.stage !== 'error';
  const fileCount = uploadedDocuments.length;
  const canUploadMore = fileCount < config.rag.maxFiles;

  /**
   * Process a PDF file: extract → chunk → embed → store in Supabase
   */
  const processFile = useCallback(
    async (file: File): Promise<boolean> => {
      // Validations
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        alert('Only PDF files are supported.');
        return false;
      }

      if (fileCount >= config.rag.maxFiles) {
        alert(`Maximum ${config.rag.maxFiles} files allowed. Please remove a file first.`);
        return false;
      }

      if (uploadedDocuments.some((doc) => doc.filename === file.name)) {
        alert(`File "${file.name}" is already uploaded.`);
        return false;
      }

      if (isProcessingRef.current) {
        alert('Please wait for the current file to finish processing.');
        return false;
      }

      isProcessingRef.current = true;

      // Add document to list with processing status
      const newDoc: UploadedDocument = {
        filename: file.name,
        chunkCount: 0,
        uploadedAt: new Date(),
        status: 'processing',
      };
      setUploadedDocuments((prev) => [...prev, newDoc]);

      try {
        // Stage 1: Extract text from PDF
        setProcessingProgress({
          stage: 'extracting',
          progress: 10,
          message: `Extracting text from ${file.name}...`,
        });
        const text = await extractTextFromPDF(file);

        if (!text || text.trim().length === 0) {
          throw new Error('No text content found in the PDF. The file might be scanned/image-based.');
        }

        // Stage 2: Chunk text
        setProcessingProgress({
          stage: 'chunking',
          progress: 25,
          message: `Splitting ${file.name} into chunks...`,
        });
        const chunks = chunkText(text);
        console.log(`Created ${chunks.length} chunks from ${file.name}`);

        // Stage 3: Generate embeddings
        setProcessingProgress({
          stage: 'embedding',
          progress: 40,
          message: `Generating embeddings (0/${chunks.length})...`,
        });
        const embeddings = await generateEmbeddings(chunks, (completed, total) => {
          const embeddingProgress = 40 + (completed / total) * 40;
          setProcessingProgress({
            stage: 'embedding',
            progress: Math.round(embeddingProgress),
            message: `Generating embeddings (${completed}/${total})...`,
          });
        });

        // Stage 4: Store in Supabase
        setProcessingProgress({
          stage: 'storing',
          progress: 85,
          message: `Storing ${chunks.length} chunks in vector database...`,
        });

        const vectorChunks = chunks.map((content, index) => ({
          content,
          embedding: embeddings[index],
          filename: file.name,
          chunkIndex: index,
          sessionId,
          metadata: {
            totalChunks: chunks.length,
            originalLength: text.length,
          },
        }));

        await insertChunks(vectorChunks);

        // Done!
        setProcessingProgress({
          stage: 'done',
          progress: 100,
          message: `${file.name} processed successfully!`,
        });

        // Update document status
        setUploadedDocuments((prev) =>
          prev.map((doc) =>
            doc.filename === file.name
              ? { ...doc, status: 'ready' as const, chunkCount: chunks.length }
              : doc
          )
        );

        // Clear progress after a delay
        setTimeout(() => setProcessingProgress(null), 2000);

        isProcessingRef.current = false;
        return true;
      } catch (error: any) {
        console.error('Error processing file:', error);

        setProcessingProgress({
          stage: 'error',
          progress: 0,
          message: error.message || 'Failed to process file',
        });

        // Update document status to error
        setUploadedDocuments((prev) =>
          prev.map((doc) =>
            doc.filename === file.name
              ? { ...doc, status: 'error' as const, errorMessage: error.message }
              : doc
          )
        );

        // Clear error progress after delay
        setTimeout(() => setProcessingProgress(null), 5000);

        isProcessingRef.current = false;
        return false;
      }
    },
    [sessionId, fileCount, uploadedDocuments]
  );

  /**
   * Query uploaded documents using vector similarity search + Gemini LLM
   */
  const queryDocuments = useCallback(
    async (query: string, language: string = 'English'): Promise<{ answer: string; sources: DocumentSearchResult[] }> => {
      // Generate query embedding for Supabase (768 dimensions)
      const supabaseQueryEmbedding = await generateEmbedding(query);
      
      // Generate query embedding for Pinecone (3072 dimensions, based on user's DB configuration)
      let pineconeQueryEmbedding: number[] = [];
      let pineconeResults: DocumentSearchResult[] = [];
      
      try {
        pineconeQueryEmbedding = await generatePineconeEmbedding(query);
        if (pineconeQueryEmbedding.length > 0) {
          try {
            pineconeResults = await searchPinecone(pineconeQueryEmbedding, config.rag.topK);
          } catch (pineconeErr: any) {
             pineconeResults = [{
                id: -1,
                content: `Pinecone Search Error: ${pineconeErr.message}`,
                filename: 'Knowledge Base Error',
                chunkIndex: 0,
                similarity: 1,
                metadata: {}
             }];
          }
        }
      } catch (err: any) {
        console.warn('Could not generate Pinecone embedding, skipping Pinecone search', err);
        pineconeResults = [{
          id: -2,
          content: `Embedding Generation Error: ${err.message}`,
          filename: 'Knowledge Base Error',
          chunkIndex: 0,
          similarity: 1,
          metadata: {}
        }];
      }

      // Search for similar chunks in Supabase
      const supabaseResults = await searchSimilar(supabaseQueryEmbedding, sessionId, config.rag.topK);

      console.log('Supabase Results:', supabaseResults);
      console.log('Pinecone Results:', pineconeResults);

      const allResults = [...supabaseResults, ...pineconeResults];

      if (allResults.length === 0) {
        return {
          answer: 'I could not find relevant information in the uploaded documents or the knowledge base for your query. Please try rephrasing your question.',
          sources: [],
        };
      }

      // Generate answer using Gemini with the retrieved context
      const contextChunks = allResults.map((r) => ({
        content: r.content,
        filename: r.filename,
        similarity: r.similarity,
      }));

      let answer = await queryWithContext(query, contextChunks, language);

      return { answer, sources: allResults };
    },
    [sessionId]
  );

  /**
   * Remove a specific document from the session
   */
  const removeDocument = useCallback(
    async (filename: string) => {
      try {
        await deleteDocuments(sessionId, filename);
        setUploadedDocuments((prev) => prev.filter((doc) => doc.filename !== filename));
      } catch (error) {
        console.error('Error removing document:', error);
        alert('Failed to remove document. Please try again.');
      }
    },
    [sessionId]
  );

  /**
   * Clear all documents from the session
   */
  const clearAllDocuments = useCallback(async () => {
    try {
      await deleteDocuments(sessionId);
      setUploadedDocuments([]);
      setProcessingProgress(null);
    } catch (error) {
      console.error('Error clearing documents:', error);
      alert('Failed to clear documents. Please try again.');
    }
  }, [sessionId]);

  return {
    uploadedDocuments,
    processingProgress,
    hasDocuments,
    isProcessing,
    canUploadMore,
    fileCount,
    processFile,
    queryDocuments,
    removeDocument,
    clearAllDocuments,
  };
}
