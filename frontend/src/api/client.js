import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 180000,
  headers: { 'Content-Type': 'application/json' }
});

export async function sendChat(query, mode, namespace, chatHistory) {
  const { data } = await api.post('/chat/', { query, mode, namespace, chat_history: chatHistory });
  return data;
}

export async function uploadFile(file, namespace) {
  const formData = new FormData();
  formData.append('file', file);
  if (namespace) formData.append('namespace', namespace);
  const { data } = await api.post('/upload/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 300000,
  });
  return data;
}

export async function exportPdf(question, answer, sources) {
  const response = await api.post('/export/', { question, answer, sources }, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.download = `MARS_QA_${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function deleteNamespace(namespace) {
  const { data } = await api.delete('/namespace/', { data: { namespace } });
  return data;
}

export async function getStatus() {
  const { data } = await api.get('/status/');
  return data;
}

export async function getAgents() {
  const { data } = await api.get('/agents/');
  return data;
}

export async function generateStudyCards(content) {
  const { data } = await api.post('/study-cards/', { content });
  return data;
}

// Studio endpoints (NotebookLM-style)
export async function studioStudyGuide(context) {
  const { data } = await api.post('/studio/study-guide/', { context });
  return data;
}

export async function studioBriefing(context) {
  const { data } = await api.post('/studio/briefing/', { context });
  return data;
}

export async function studioFlashcards(context) {
  const { data } = await api.post('/studio/flashcards/', { context });
  return data;
}

export async function studioKeyTopics(context) {
  const { data } = await api.post('/studio/key-topics/', { context });
  return data;
}

export async function studioAudio(context) {
  const { data } = await api.post('/studio/audio/', { context });
  return data;
}
