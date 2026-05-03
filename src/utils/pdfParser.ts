import config from '@/config';

/**
 * Extract all text content from a PDF file using Gemini 2.0 Flash's multimodal OCR via proxy.
 * This handles both digital and scanned (image-based) PDFs seamlessly.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1]; // Remove "data:application/pdf;base64," prefix
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch('/api/gemini-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.gemini.chatModel,
      contents: [{
        role: 'user',
        parts: [
          { text: 'Please accurately transcribe all the text in this document. Extract it exactly as it appears. Do not add any extra commentary or conversational filler. Just return the extracted text.' },
          { inlineData: { mimeType: 'application/pdf', data: base64Data } }
        ]
      }]
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini OCR error (${response.status}): ${errorData?.error || response.statusText}`
    );
  }

  const data = await response.json();
  const candidates = data.candidates;
  
  if (!candidates || candidates.length === 0) {
    throw new Error('No text could be extracted from this PDF.');
  }

  return candidates[0].content.parts.map((p: any) => p.text).join('\n\n');
}

/**
 * Split text into overlapping chunks using a sliding window approach.
 * Tries to break on sentence boundaries when possible.
 */
export function chunkText(
  text: string,
  chunkSize: number = config.rag.chunkSize,
  overlap: number = config.rag.chunkOverlap
): string[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.replace(/\s+/g, ' ').trim();

  if (cleanText.length <= chunkSize) {
    return [cleanText];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleanText.length) {
    let end = start + chunkSize;
    let isLastChunk = false;

    if (end < cleanText.length) {
      // Try to break at sentence boundary (., !, ?)
      const lastSentenceEnd = Math.max(
        cleanText.lastIndexOf('. ', end),
        cleanText.lastIndexOf('! ', end),
        cleanText.lastIndexOf('? ', end)
      );

      // Only use sentence boundary if it's within reasonable range
      if (lastSentenceEnd > start + chunkSize * 0.5) {
        end = lastSentenceEnd + 1;
      }
    } else {
      end = cleanText.length;
      isLastChunk = true;
    }

    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    if (isLastChunk) {
      break;
    }

    start = end - overlap;

    // Prevent infinite loops just in case
    if (start >= cleanText.length) break;
  }

  return chunks;
}
