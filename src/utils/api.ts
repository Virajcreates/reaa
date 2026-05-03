import config from '@/config';
import type { N8nChatResponse, StreamEvent } from '@/types';

export async function sendChatMessage(
  message: string,
  sessionId: string
): Promise<N8nChatResponse> {
  try {
    const response = await fetch(config.n8n.chatEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chatInput: message,  // n8n expects 'chatInput' field
        sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export function createStreamConnection(
  sessionId: string,
  onToken: (text: string) => void,
  onEnd: () => void,
  onError: (error: string) => void
): EventSource {
  const streamUrl = `${config.n8n.streamEndpoint}?sessionId=${sessionId}`;
  const eventSource = new EventSource(streamUrl);

  eventSource.onmessage = (event) => {
    try {
      const data: StreamEvent = JSON.parse(event.data);
      
      if (data.type === 'token' && data.data.text) {
        onToken(data.data.text);
      } else if (data.type === 'agent-end') {
        eventSource.close();
        onEnd();
      } else if (data.type === 'error') {
        eventSource.close();
        onError(data.data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error parsing stream data:', error);
      onError('Error parsing response');
    }
  };

  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
    onError('Connection error');
  };

  return eventSource;
}

export async function uploadFile(file: File, sessionId: string): Promise<void> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('sessionId', sessionId);

  try {
    const response = await fetch(config.n8n.chatEndpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status}`);
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}
