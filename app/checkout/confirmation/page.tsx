'use client';

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const invoicePayloadEncoded = searchParams.get("invoicePayload");
  const totalCost = searchParams.get("totalCost");
  const [error, setError] = useState("");

  const handleDownloadInvoice = async () => {
    setError("");
    if (!invoicePayloadEncoded) {
      setError("Missing invoice data.");
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
    } catch (err: any) {
      setError(err.message || "Error downloading invoice");
    }
  };
  

  return (
    <div className="max-w-3xl mx-auto p-4 text-center">
      <h2 className="text-2xl font-bold mb-4">Checkout Confirmation</h2>
      <p className="mb-4">
        Your bookings have been confirmed. Total Cost: ${totalCost}
      </p>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <button onClick={handleDownloadInvoice} className="btn btn-primary">
        Download Invoice
      </button>
    </div>
  );
}
