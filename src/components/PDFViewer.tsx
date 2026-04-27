import React, { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Set worker path for PDF.js
// Set worker path for PDF.js
if (typeof window !== "undefined") {
    // Use unpkg as it's generally more reliable and has better version matching
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
    pdfUrl: string;
    fileName: string;
}

export default function PDFViewer({ pdfUrl, fileName }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const pdfRef = useRef<pdfjsLib.PDFDocument | null>(null);
    const [scale, setScale] = useState(1.5);

    // Load PDF
    useEffect(() => {
        const loadPdf = async () => {
            try {
                setLoading(true);
                setError(null);
                const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
                pdfRef.current = pdf;
                setNumPages(pdf.numPages);
                setCurrentPage(1);
            } catch (err) {
                console.error("Error loading PDF:", err);
                setError("Gagal memuat file PDF. Silakan coba download langsung.");
            } finally {
                setLoading(false);
            }
        };

        loadPdf();
    }, [pdfUrl]);

    // Render page
    useEffect(() => {
        if (!pdfRef.current || !canvasRef.current) return;

        const renderPage = async () => {
            try {
                const page = await pdfRef.current!.getPage(currentPage);
                const viewport = page.getViewport({ scale });

                const canvas = canvasRef.current!;
                const context = canvas.getContext("2d");

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context!,
                    viewport: viewport,
                };

                await page.render(renderContext).promise;
            } catch (err) {
                console.error("Error rendering page:", err);
            }
        };

        renderPage();
    }, [currentPage, scale]);

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <div className="mb-4 text-red-500">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <p className="text-red-700 font-bold mb-2">{error}</p>
                <p className="text-red-600/70 text-sm mb-6">
                    Hal ini biasanya terjadi karena pembatasan keamanan (CORS) pada server penyedia file.
                </p>
                <a 
                    href={pdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                >
                    Buka PDF di Tab Baru
                </a>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Toolbar */}
            <div className="bg-gray-900 text-white px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                <div className="text-sm font-medium">
                    {fileName} {loading ? "(memuat...)" : `(${numPages} halaman)`}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {/* Page Navigation */}
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1 || loading}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition-colors"
                        title="Halaman sebelumnya"
                    >
                        ← Prev
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="1"
                            max={numPages}
                            value={currentPage}
                            onChange={(e) =>
                                setCurrentPage(
                                    Math.min(
                                        numPages,
                                        Math.max(1, parseInt(e.target.value) || 1),
                                    ),
                                )
                            }
                            disabled={loading}
                            className="w-12 px-2 py-1 bg-gray-700 text-white rounded text-sm text-center"
                        />
                        <span className="text-sm">/ {numPages}</span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                        disabled={currentPage >= numPages || loading}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition-colors"
                        title="Halaman berikutnya"
                    >
                        Next →
                    </button>

                    {/* Zoom Controls */}
                    <div className="border-l border-gray-700 pl-3 ml-3 flex items-center gap-2">
                        <button
                            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
                            disabled={scale <= 0.5 || loading}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition-colors"
                            title="Perkecil"
                        >
                            −
                        </button>
                        <span className="text-sm w-12 text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(Math.min(3, scale + 0.2))}
                            disabled={scale >= 3 || loading}
                            className="px-2 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded text-sm transition-colors"
                            title="Perbesar"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {/* PDF Viewer */}
            <div className="bg-gray-100 overflow-auto p-4" style={{ maxHeight: "70vh" }}>
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Memuat PDF...</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <canvas
                            ref={canvasRef}
                            className="shadow-lg border border-gray-300 rounded"
                        />
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 text-sm text-gray-600">
                <p>
                    💡 Anda dapat menelusuri halaman, memperbesar/memperkecil tampilan, dan mengunduh file dengan tombol di atas.
                </p>
            </div>
        </div>
    );
}
