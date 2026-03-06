import React, { useState, useEffect } from 'react';

export default function DocumentManager({ onClose, onSelectDocument }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/namespace/`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setDocuments(data.namespaces || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, namespace) => {
    e.stopPropagation(); // prevent selecting the document
    if (!window.confirm('Are you sure you want to delete this document from the library?')) return;
    
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/namespace/`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace })
      });
      
      if (response.ok) {
        setDocuments(docs => docs.filter(d => d.namespace !== namespace));
      } else {
        alert('Failed to delete document');
      }
    } catch (err) {
      alert('Error deleting document: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">library_books</span>
            <div>
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Document Library</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage uploaded PDFs</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-slate-950/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-slate-500 gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
              <p>Loading library...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-700 mb-4">folder_open</span>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Library is empty</h3>
              <p className="text-sm text-slate-500">Upload a PDF in Student Mode to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => (
                <div 
                  key={doc.namespace}
                  onClick={() => onSelectDocument(doc.namespace)}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group flex flex-col relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDelete(e, doc.namespace)}
                      className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"
                      title="Delete Namespace"
                    >
                      <span className="material-symbols-outlined text-sm block">delete</span>
                    </button>
                  </div>

                  <div className="flex items-start gap-3 mb-3 pr-8">
                    <div className="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined">picture_as_pdf</span>
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-semibold text-slate-800 dark:text-slate-200 truncate" title={doc.filename}>
                        {doc.filename}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">menu_book</span>
                          {doc.page_count}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">data_object</span>
                          {doc.chunk_count}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    {doc.is_expired ? (
                      <span className="text-red-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">timer</span> Expired</span>
                    ) : (
                      <span className="text-emerald-500 flex items-center gap-1"><span className="material-symbols-outlined text-xs">check_circle</span> Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
