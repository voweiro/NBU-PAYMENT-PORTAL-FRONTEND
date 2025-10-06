"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import Header from "@/components/Header";

const API_URL = process.env.NEXT_PUBLIC_API_URL!;
const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Your University";

type PaymentStatus = "successful" | "pending" | "failed";

export default function PaymentLookupPage() {
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState<"idle" | "checking" | "generating">("idle");
  const [result, setResult] = useState<{
    payment_id: number;
    transaction_ref: string;
    status: PaymentStatus;
    amount_paid: number;
    receipt_drive_url: string | null;
    student_email?: string;
    student_name?: string | null;
  } | null>(null);

  const onCheckStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    const ref = reference.trim();
    if (!ref) {
      toast.warn("Enter your payment reference");
      return;
    }
    setLoading("checking");
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/payments/by-ref/${encodeURIComponent(ref)}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = typeof json.error === "string" ? json.error : "Lookup failed";
        toast.error(msg);
        setLoading("idle");
        return;
      }
      setResult(json.data);
      setLoading("idle");
      toast.success("Payment found");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      toast.error(message);
      setLoading("idle");
    }
  };

  const onGenerateReceipt = async () => {
    if (!result?.payment_id) return;
    setLoading("generating");
    try {
      const res = await fetch(`${API_URL}/receipts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: result.payment_id }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        const msg = typeof json.error === "string" ? json.error : "Failed to generate receipt";
        toast.error(msg);
        setLoading("idle");
        return;
      }
      setResult((prev) => prev ? { ...prev, receipt_drive_url: json.data?.receiptUrl ?? null } : prev);
      toast.success("Receipt generated");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      toast.error(message);
    } finally {
      setLoading("idle");
    }
  };

  const onViewReceipt = () => {
    const link = result?.receipt_drive_url;
    if (!link) {
      toast.info("No receipt link yet. Generate it first.");
      return;
    }
    try {
      const a = document.createElement("a");
      a.href = link;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.click();
    } catch {
      window.open(link, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <Header currentPage="lookup" showThemeToggle={true} />
      
      <main className="max-w-xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Page Title */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Payment Status & Receipt</h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">Enter your reference to check payment and get your receipt.</p>
          </div>

        {/* Form */}
        <form onSubmit={onCheckStatus} className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
          <label className="block text-xs font-medium">Payment Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g., PSK_12345 or FLW_abcde"
            className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-950 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={loading !== "idle"}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-black text-white dark:bg-white dark:text-black disabled:opacity-50"
          >
            {loading === "checking" && (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white dark:border-black/60 dark:border-t-black" />
            )}
            {loading === "checking" ? "Checking" : "Check Status"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 space-y-3">
            <h2 className="text-base font-semibold">Result</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4 text-sm">
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Reference:</span>
                <div className="font-mono break-all">{result.transaction_ref}</div>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Status:</span>
                <div className="font-mono capitalize">{result.status}</div>
              </div>
              <div>
                <span className="text-neutral-600 dark:text-neutral-400">Amount Paid:</span>
                <div className="font-mono">₦{Number(result.amount_paid).toLocaleString()}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 flex flex-wrap gap-2">
              <a href="/payment" className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700">Back to Payment</a>
              {result.status === "successful" ? (
                <>
                  <button
                    onClick={onViewReceipt}
                    disabled={!result.receipt_drive_url}
                    className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    View Receipt
                  </button>
                  {!result.receipt_drive_url && (
                    <button
                      onClick={onGenerateReceipt}
                      disabled={loading !== "idle"}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                    >
                      {loading === "generating" ? "Generating..." : "Generate Receipt"}
                    </button>
                  )}
                </>
              ) : (
                <p className="text-xs text-neutral-600 dark:text-neutral-400">Only successful payments have receipts.</p>
              )}
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}