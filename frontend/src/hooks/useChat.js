import { useState, useCallback, useRef } from 'react';
import { uploadFile, deleteNamespace } from '../api/client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('student');
  const [namespace, setNamespace] = useState(() => crypto.randomUUID());
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [agentTrace, setAgentTrace] = useState([]);
  const [streamingContent, setStreamingContent] = useState('');
  const abortRef = useRef(null);

  const send = useCallback(async (query) => {
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setAgentTrace([]);
    setStreamingContent('');

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      // Use SSE streaming endpoint
      const controller = new AbortController();
      abortRef.current = controller;

      const response = await fetch(`${API_BASE}/chat/stream/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          mode,
          namespace,
          chat_history: chatHistory,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let agentLogs = [];
      let metadata = {};
      let buffer = '';

      // Add a placeholder assistant message that we'll update
      const placeholderIdx = messages.length + 1; // +1 for user msg just added
      setMessages(prev => [...prev, { role: 'assistant', content: '', metadata: {} }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'agent') {
              agentLogs.push(event.data);
              setAgentTrace([...agentLogs]);
            }

            if (event.type === 'token') {
              accumulated += event.content;
              // Update the last message content live
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
                }
                return updated;
              });
            }

            if (event.type === 'done') {
              metadata = event.metadata || {};
            }

            if (event.type === 'error') {
              accumulated = `⚠️ **Error**: ${event.message}`;
              setMessages(prev => {
                const updated = [...prev];
                const lastIdx = updated.length - 1;
                if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
                  updated[lastIdx] = { ...updated[lastIdx], content: accumulated };
                }
                return updated;
              });
            }
          } catch (parseErr) {
            // Skip malformed JSON
          }
        }
      }

      // Final update with metadata
      setMessages(prev => {
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant') {
          updated[lastIdx] = {
            ...updated[lastIdx],
            content: accumulated || 'No answer generated.',
            metadata: {
              grounding_score: metadata.grounding_score,
              critic_status: metadata.critic_status,
              papers_metadata: metadata.papers_metadata,
              retrieved_sources: metadata.retrieved_sources,
              intent: metadata.intent,
              elapsed_time: metadata.elapsed_time,
            }
          };
        }
        return updated;
      });

      setLastResponse({
        answer: accumulated,
        agent_logs: agentLogs,
        ...metadata,
      });

    } catch (error) {
      if (error.name === 'AbortError') return;
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ **Error**: ${error.message || 'Something went wrong. Please try again.'}`,
      };
      setMessages(prev => {
        // Replace the placeholder if it exists
        const updated = [...prev];
        const lastIdx = updated.length - 1;
        if (lastIdx >= 0 && updated[lastIdx].role === 'assistant' && !updated[lastIdx].content) {
          updated[lastIdx] = errorMsg;
        } else {
          updated.push(errorMsg);
        }
        return updated;
      });
    } finally {
      setIsLoading(false);
      setStreamingContent('');
      abortRef.current = null;
    }
  }, [messages, mode, namespace, isLoading]);

  const upload = useCallback(async (file) => {
    setIsUploading(true);
    try {
      const result = await uploadFile(file, namespace);
      setUploadedFile({
        name: file.name,
        size: file.size,
        pages: result.pages,
        chunks: result.chunks,
      });
      return result;
    } catch (error) {
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [namespace]);

  const clearChat = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    try {
      await deleteNamespace(namespace);
    } catch (e) { /* ignore */ }
    setMessages([]);
    setLastResponse(null);
    setAgentTrace([]);
    setUploadedFile(null);
    setStreamingContent('');
    setNamespace(crypto.randomUUID());
  }, [namespace]);

  const changeMode = useCallback((newMode) => {
    setMode(newMode);
  }, []);

  return {
    messages,
    isLoading,
    mode,
    namespace,
    uploadedFile,
    isUploading,
    lastResponse,
    agentTrace,
    streamingContent,
    send,
    upload,
    clearChat,
    changeMode,
  };
}
