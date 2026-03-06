import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


export default function PdfViewer({ namespace, onClose, initialPage = 1 }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const pdfUrl = `${apiUrl}/api/document/?namespace=${namespace}`;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error) {
    console.error("PDF Load Error:", error);
    setError(error.message);
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex bg-black/80 backdrop-blur-sm">
      
      {/* Sidebar Controls */}
      <div className="w-16 md:w-64 bg-slate-900 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="hidden md:flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">picture_as_pdf</span>
            <span className="font-bold text-white tracking-tight truncate">MARS Viewer</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 md:p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full mx-auto md:mx-0 transition-colors"
          >
            <span className="material-symbols-outlined block">close</span>
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center gap-6 p-4">
          <button 
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber(p => p - 1)}
            className="p-3 md:p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors group text-white outline-none"
          >
            <span className="material-symbols-outlined group-active:-translate-y-1 transition-transform">arrow_upward</span>
            <span className="hidden md:block ml-2 font-medium">Previous Page</span>
          </button>
          
          <div className="text-center font-mono text-slate-400">
            <span className="md:hidden text-xs block">Page</span>
            <span className="text-white font-bold text-lg md:text-2xl">{pageNumber}</span>
            <span className="mx-1">/</span>
            <span className="text-sm md:text-base">{numPages || '-'}</span>
          </div>

          <button 
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber(p => p + 1)}
            className="p-3 md:p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 flex items-center justify-center transition-colors group text-white outline-none"
          >
            <span className="material-symbols-outlined group-active:translate-y-1 transition-transform">arrow_downward</span>
            <span className="hidden md:block ml-2 font-medium">Next Page</span>
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 overflow-auto flex justify-center py-8 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <span className="material-symbols-outlined animate-spin text-4xl mb-4">refresh</span>
            <p>Loading Encrypted PDF...</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 bg-red-500/10 p-8 rounded-2xl max-w-md m-auto text-center">
            <span className="material-symbols-outlined text-4xl mb-2">error</span>
            <p className="font-bold">Error loading PDF</p>
            <p className="text-sm opacity-80 mt-1">{error}</p>
          </div>
        )}
        
        <div className={`transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'} shadow-2xl shadow-black/50`}>
          <Document 
            file={pdfUrl} 
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={null}
          >
            <Page 
              pageNumber={pageNumber} 
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="bg-white rounded-md overflow-hidden"
              scale={1.2}
            />
          </Document>
        </div>
      </div>

    </div>
  );
}
