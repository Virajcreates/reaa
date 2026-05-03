import config from '@/config';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Extract all text content from a PDF file using Gemini multimodal OCR.
 * Tries the local proxy first, falls back to direct call.
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  // Convert File to Base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const payload = {
    contents: [{
      role: 'user',
      parts: [
        { text: 'Please accurately transcribe all the text in this document. Extract it exactly as it appears. Do not add any extra commentary or conversational filler. Just return the extracted text.' },
        { inlineData: { mimeType: 'application/pdf', data: base64Data } }
      ]
    }]
  };

  let response;
  try {
    // 1. Try local proxy (Production)
    response = await fetch('/api/gemini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.gemini.chatModel,
        ...payload
      })
    });

    if (response.status === 404) response = null;
  } catch (e) {
    response = null;
  }

  // 2. Fallback to direct call (Local Dev)
  if (!response) {
    const url = `${GEMINI_BASE_URL}/models/${config.gemini.chatModel}:generateContent?key=${config.gemini.apiKey}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini OCR error (${response.status}): ${errorData?.error?.message || response.statusText}`
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
 */
export function chunkText(
  text: string,
  chunkSize: number = config.rag.chunkSize,
  overlap: number = config.rag.chunkOverlap
): string[] {
  if (!text || text.trim().length === 0) return [];
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length <= chunkSize) return [cleanText];

  const chunks: string[] = [];
  let start = 0;
  while (start < cleanText.length) {
    let end = start + chunkSize;
    let isLastChunk = false;
    if (end < cleanText.length) {
      const lastSentenceEnd = Math.max(
        cleanText.lastIndexOf('. ', end),
        cleanText.lastIndexOf('! ', end),
        cleanText.lastIndexOf('? ', end)
      );
      if (lastSentenceEnd > start + chunkSize * 0.5) end = lastSentenceEnd + 1;
    } else {
      end = cleanText.length;
      isLastChunk = true;
    }
    const chunk = cleanText.slice(start, end).trim();
    if (chunk.length > 0) chunks.push(chunk);
    if (isLastChunk) break;
    start = end - overlap;
    if (start >= cleanText.length) break;
  }
  return chunks;
}
