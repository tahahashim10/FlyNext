'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Loading component to show while the search params are loading
function SearchParamsLoading() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-muted/5 py-12 px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-md border border-border text-center">
        <div className="animate-pulse">
          <div className="h-16 w-16 bg-muted/50 rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-muted/50 rounded w-3/4 mx-auto mb-2"></div>
          <div className="h-4 bg-muted/50 rounded w-1/2 mx-auto mb-6"></div>
          <div className="h-12 bg-muted/50 rounded mb-4"></div>
          <div className="h-12 bg-muted/50 rounded mb-4"></div>
        </div>
      </div>
    </div>
  );
}

// Component that uses useSearchParams
function ConfirmationContent() {
  const searchParams = useSearchParams();
  const invoicePayloadEncoded = searchParams.get("invoicePayload");
  const totalCost = searchParams.get("totalCost");
  const [error, setError] = React.useState("");
  const [downloading, setDownloading] = React.useState(false);
  const [downloadComplete, setDownloadComplete] = React.useState(false);

  const handleDownloadInvoice = async () => {
    setError("");
    setDownloading(true);
    
    if (!invoicePayloadEncoded) {
      setError("Missing invoice data.");
      setDownloading(false);
      return;
    }
    
    try {
      const rawPayload = JSON.parse(atob(invoicePayloadEncoded));
      // Transform the payload to have the expected keys.
      const transformedPayload = rawPayload.map((b: any) => ({
        bookingId: Number(b.id),
        bookingType: b.type
      }));
      
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookings: transformedPayload }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invoice generation failed");
      }
      
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice_consolidated.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      
      setDownloadComplete(true);
    } catch (err: any) {
      setError(err.message || "Error downloading invoice");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-muted/5 py-12 px-4">
      <div className="max-w-md w-full bg-card p-8 rounded-xl shadow-md border border-border">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-16 w-16 text-green-500">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted mb-6">
            Thank you for your booking with FlyNext.
          </p>
          
          <div className="border-t border-b border-border py-4 my-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted">Total Amount:</span>
              <span className="font-semibold text-xl">${totalCost}</span>
            </div>
            <div className="text-sm text-muted">
              A confirmation email has been sent to your registered email address.
            </div>
          </div>
          
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          {downloadComplete && !error && (
            <div className="flex items-center space-x-2 p-3 bg-green-500/10 text-green-700 rounded-lg text-sm mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Invoice downloaded successfully!</span>
            </div>
          )}
          
          <button 
            onClick={handleDownloadInvoice} 
            className={`btn-primary w-full flex items-center justify-center mb-4 ${downloading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                Downloading...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Invoice
              </>
            )}
          </button>
          
          <div className="space-y-3">
            <a href="/bookings/user" className="btn-outline w-full block text-center">
              View My Bookings
            </a>
            <a href="/" className="text-primary hover:underline block text-center">
              Return to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps the content with Suspense
export default function ConfirmationPage() {
  return (
    <Suspense fallback={<SearchParamsLoading />}>
      <ConfirmationContent />
    </Suspense>
  );
}