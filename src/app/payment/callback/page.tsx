"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch } from "@/store";
import { verifyPayment } from "@/store/paymentSlice";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  ArrowLeftIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Nigerian British University";
const API_URL = process.env.NEXT_PUBLIC_API_URL!;

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  const [status, setStatus] = useState<"verifying" | "success" | "failed">("verifying");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [program, setProgram] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [providerCode, setProviderCode] = useState<string | null>(null);
  const [providerMessage, setProviderMessage] = useState<string | null>(null);

  useEffect(() => {
    const gatewayParam = searchParams.get("gateway") as
      | "paystack"
      | "flutterwave"
      | "global"
      | null;
    const reference =
      searchParams.get("reference") ||
      searchParams.get("tx_ref") ||
      searchParams.get("txnref") ||
      searchParams.get("globalpay_ref") ||
      searchParams.get("Ref");
    if (!gatewayParam || !reference) {
      setStatus("failed");
      return;
    }

    setPaymentReference(reference);

    const verify = async () => {
      try {
        const result = await dispatch(
          verifyPayment({ reference, gateway: gatewayParam })
        ).unwrap() as { status: string; paymentId?: number; verifyData?: { responseCode?: string; responseMessage?: string; error?: string } };
        setStatus(result.status === "successful" ? "success" : "failed");
        setPaymentId(result.paymentId ?? null);
        const vd = result?.verifyData ?? {};
        setProviderCode(vd?.responseCode ?? null);
        setProviderMessage(vd?.responseMessage ?? vd?.error ?? null);
      } catch (error) {
        setStatus("failed");
        const msg = error instanceof Error ? error.message : "Verification failed";
        setErrorMsg(msg);
      }
    };

    // Add a small delay for better UX
    const timer = setTimeout(verify, 1500);
    return () => clearTimeout(timer);
  }, [searchParams, dispatch]);

  const handleGoHome = () => {
    router.push("/");
  };

  const handleViewReceipt = async () => {
    if (status !== "success") return;
    if (!paymentId) {
      router.push(`/payment/lookup?ref=${encodeURIComponent(paymentReference)}`);
      return;
    }
    try {
      // First try to fetch existing receipt link
      const res = await fetch(`${API_URL}/receipts/${paymentId}`);
      const json = await res.json();
      if (res.ok && json.success && json.data?.receiptUrl) {
        const link: string = json.data.receiptUrl;
        const a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
        return;
      }

      // If no link, generate a new receipt
      const genRes = await fetch(`${API_URL}/receipts/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: paymentId }),
      });
      const genJson = await genRes.json();
      if (genRes.ok && genJson.success && genJson.data?.receiptUrl) {
        const link: string = genJson.data.receiptUrl;
        const a = document.createElement("a");
        a.href = link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.click();
      } else {
        // Fallback to lookup page where user can manage receipt
        router.push(`/payment/lookup?ref=${encodeURIComponent(paymentReference)}`);
      }
    } catch {
      router.push(`/payment/lookup?ref=${encodeURIComponent(paymentReference)}`);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "verifying":
        return <ClockIcon className="w-16 h-16 text-blue-500 animate-pulse" />;
      case "success":
        return <CheckCircleIcon className="w-16 h-16 text-blue-500" />;
      case "failed":
        return <XCircleIcon className="w-16 h-16 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "verifying":
        return "from-blue-500 to-blue-600";
      case "success":
        return "from-blue-500 to-blue-600";
      case "failed":
        return "from-red-500 to-red-600";
    }
  };

  const getBackgroundGradient = () => {
    switch (status) {
      case "verifying":
        return "from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-blue-900 dark:to-red-900";
      case "success":
        return "from-blue-50 via-white to-red-50 dark:from-gray-900 dark:via-blue-900 dark:to-red-900";
      case "failed":
        return "from-red-50 via-white to-blue-50 dark:from-gray-900 dark:via-red-900 dark:to-blue-900";
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-red-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-400/5 to-blue-400/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* University Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-red-500/30">
                <ShieldCheckIcon className="w-7 h-7 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{UNIVERSITY_NAME}</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Payment Verification System</p>
              </div>
            </div>
          </div>

          {/* Main Status Card */}
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/50 shadow-2xl shadow-red-500/10 overflow-hidden">
            {/* Status Header */}
            <div className={`bg-gradient-to-r ${getStatusColor()} p-6 text-center`}>
              <div className="flex justify-center mb-4">
                {getStatusIcon()}
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {status === "verifying" && "Verifying Payment"}
                {status === "success" && "Payment Successful"}
                {status === "failed" && "Payment Verification Failed"}
              </h2>
              <p className="text-white/90 text-lg">
                {status === "verifying" && "Please wait while we verify your payment..."}
                {status === "success" && "Your payment has been successfully processed"}
                {status === "failed" && "We couldn't verify your payment"}
              </p>
            </div>

            {/* Content Area */}
            <div className="p-8">
              {status === "verifying" && (
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-gray-700 dark:text-gray-300 font-medium">Processing your transaction...</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">This may take a few moments</p>
                  </div>
                  {paymentReference && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">Reference: {paymentReference}</p>
                    </div>
                  )}
                </div>
              )}

              {status === "success" && (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <CheckCircleIcon className="w-4 h-4" />
                      Transaction Completed
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Your payment has been successfully processed and recorded in our system.
                    </p>
                  </div>

                  {/* Payment Details */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      <CreditCardIcon className="w-5 h-5" />
                      Payment Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {paymentReference && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Reference Number</p>
                          <p className="font-mono text-sm bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border">{paymentReference}</p>
                        </div>
                      )}
                      {amount && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Amount Paid</p>
                          <p className="font-semibold text-lg text-blue-600 dark:text-blue-400">₦{amount}</p>
                        </div>
                      )}
                      {studentName && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Student Name</p>
                          <p className="font-medium text-gray-900 dark:text-white">{studentName}</p>
                        </div>
                      )}
                      {program && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Program</p>
                          <p className="font-medium text-gray-900 dark:text-white">{program}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleViewReceipt}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <DocumentTextIcon className="w-5 h-5" />
                      Download Receipt
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold py-3 px-6 rounded-xl border border-blue-600 dark:border-blue-400 shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      Back to Home
                    </button>
                  </div>
                </div>
              )}

              {status === "failed" && (
                <div className="space-y-6">
                  {/* Error Message */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 rounded-full text-sm font-medium mb-4">
                      <ExclamationTriangleIcon className="w-4 h-4" />
                      Verification Failed
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      We encountered an issue while verifying your payment. This could be due to:
                    </p>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800 text-left">
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                        <li>• Payment was cancelled or declined</li>
                        <li>• Network connectivity issues</li>
                        <li>• Invalid payment reference</li>
                        <li>• Payment is still being processed by the bank</li>
                        {providerCode && (
                          <li>
                            • Provider Code: <span className="font-mono">{providerCode}</span>
                          </li>
                        )}
                        {(providerMessage || errorMsg) && (
                          <li>
                            • Message: {providerMessage ?? errorMsg}
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Reference Info */}
                  {paymentReference && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Transaction Reference</h3>
                      <p className="font-mono text-sm bg-white dark:bg-gray-700 px-3 py-2 rounded-lg border">{paymentReference}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Please keep this reference number for your records and contact support if needed.
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ClockIcon className="w-5 h-5" />
                      Retry Verification
                    </button>
                    <button
                      onClick={handleGoHome}
                      className="flex-1 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold py-3 px-6 rounded-xl border border-blue-600 dark:border-blue-400 shadow-sm hover:shadow-md transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      Back to Home
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Need help? Contact our support team at{" "}
              <a href="mailto:support@university.edu" className="text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium transition-colors">
                support@university.edu
              </a>
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              © 2024 {UNIVERSITY_NAME}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PaymentCallbackContent />
    </Suspense>
  );
}