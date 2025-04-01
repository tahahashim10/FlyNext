
'use client';

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { Download, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const invoicePayloadEncoded = searchParams.get("invoicePayload");
  const totalCost = searchParams.get("totalCost");
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);

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
            <CheckCircle className="h-16 w-16 text-green-500" />
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
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
          
          {downloadComplete && !error && (
            <div className="flex items-center space-x-2 p-3 bg-green-500/10 text-green-700 rounded-lg text-sm mb-6">
              <CheckCircle className="h-4 w-4" />
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
                <Download className="h-5 w-5 mr-2" />
                Download Invoice
              </>
            )}
          </button>
          
          <div className="space-y-3">
            <Link href="/bookings/user" className="btn-outline w-full block text-center">
              View My Bookings
            </Link>
            <Link href="/" className="text-primary hover:underline block text-center">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
