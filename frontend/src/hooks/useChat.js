import { useState, useCallback, useRef } from 'react';
import { sendChat, uploadFile, deleteNamespace } from '../api/client';

export function useChat() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('student');
  const [namespace, setNamespace] = useState(() => crypto.randomUUID());
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [lastResponse, setLastResponse] = useState(null);
  const [agentTrace, setAgentTrace] = useState([]);

  const send = useCallback(async (query) => {
    if (!query.trim() || isLoading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    setAgentTrace([]);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const response = await sendChat(query, mode, namespace, chatHistory);

      const assistantMsg = {
        role: 'assistant',
        content: response.answer,
        metadata: {
          grounding_score: response.grounding_score,
          critic_status: response.critic_status,
          critic_reason: response.critic_reason,
          papers_metadata: response.papers_metadata,
          retrieved_sources: response.retrieved_sources,
          intent: response.intent,
          elapsed_time: response.elapsed_time,
        }
      };

      setMessages(prev => [...prev, assistantMsg]);
      setLastResponse(response);
      setAgentTrace(response.agents_executed || []);
    } catch (error) {
      const errorMsg = {
        role: 'assistant',
        content: `⚠️ **Error**: ${error.response?.data?.error || error.message || 'Something went wrong. Please try again.'}`,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
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
    try {
      await deleteNamespace(namespace);
    } catch (e) { /* ignore */ }
    setMessages([]);
    setLastResponse(null);
    setAgentTrace([]);
    setUploadedFile(null);
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
    send,
    upload,
    clearChat,
    changeMode,
  };
}
