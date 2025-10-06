"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import type { RootState } from "@/store";
import { fetchPrograms, type Program } from "@/store/programsSlice";
import { fetchFeesByProgram, type Fee, type Level } from "@/store/feesSlice";
import { initiatePayment } from "@/store/paymentSlice";
import { toast } from "react-toastify";
import Header from "@/components/Header";

const UNIVERSITY_NAME = process.env.NEXT_PUBLIC_UNIVERSITY_NAME ?? "Your University";

type StudentCategory = "new" | "returning";
type ProgramType = Program["program_type"]; // "undergraduate" | "postgraduate" | "diploma" | "pre_degree"

export default function StudentPaymentPage() {
  const dispatch = useAppDispatch();

  const programs = useAppSelector((state: RootState) => state.programs.items);
  const programsStatus = useAppSelector((state: RootState) => state.programs.status);
  const fees = useAppSelector((state: RootState) => state.fees.items);
  const feesStatus = useAppSelector((state: RootState) => state.fees.status);

  const initStatus = useAppSelector((state: RootState) => state.payment.initStatus);
  const payUrl = useAppSelector((state: RootState) => state.payment.payUrl);
  const paymentError = useAppSelector((state: RootState) => state.payment.error);
  const gateway = useAppSelector((state: RootState) => state.payment.gateway);

  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [programType, setProgramType] = useState<ProgramType | "">("");
  const [programId, setProgramId] = useState<number | undefined>(undefined);
  const [studentCategory, setStudentCategory] = useState<StudentCategory>("new");
  const [jambNumber, setJambNumber] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [selectedFeeId, setSelectedFeeId] = useState<number | undefined>(undefined);
  const [percent, setPercent] = useState<50 | 100>(100);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [level, setLevel] = useState<Level | undefined>(undefined);
  const [generatedReference, setGeneratedReference] = useState<string | null>(null);
  const [initiationUrl, setInitiationUrl] = useState<string | null>(null);

  useEffect(() => {
    if (programsStatus === "idle") {
      dispatch(fetchPrograms());
    }
  }, [dispatch, programsStatus]);

  const programOptions = useMemo(() => {
    if (!programType) return [] as Program[];
    return programs.filter((p) => p.program_type === programType);
  }, [programs, programType]);

  useEffect(() => {
    if (programId) {
      dispatch(fetchFeesByProgram(programId));
    }
  }, [dispatch, programId]);

  // Reset level when program type, program, or fee changes
  useEffect(() => {
    setLevel(undefined);
  }, [programType, programId, selectedFeeId]);

  useEffect(() => {
    if (paymentError) toast.error(paymentError);
  }, [paymentError]);

  const selectedFee: Fee | undefined = useMemo(() => fees.find((f) => f.fee_id === selectedFeeId), [fees, selectedFeeId]);
  const feeAmount = selectedFee ? Number(selectedFee.amount) : 0;
  const payableAmount = Math.round(feeAmount * (percent / 100));
  const feesForLevel = useMemo(() => {
    if (!programId) return [] as Fee[];
    if (programType !== "undergraduate") return fees;
    if (!level) return [] as Fee[];
    return fees.filter((f) => {
      const lvls = f.levels ?? null;
      if (!lvls || lvls.length === 0 || lvls.includes("ALL")) return true;
      return !!level && lvls.includes(level);
    });
  }, [fees, programId, programType, level]);

  // Available levels for undergraduates:
  const allStudentLevels: Exclude<Level, "ALL">[] = ["L100", "L200", "L300", "L400", "L500", "L600"];
  const availableLevels: Exclude<Level, "ALL">[] = useMemo(() => {
    if (!selectedFee) return allStudentLevels;
    const lvls = selectedFee.levels ?? null;
    if (!lvls || lvls.length === 0 || lvls.includes("ALL")) return allStudentLevels;
    return lvls.filter((l) => l !== "ALL") as Exclude<Level, "ALL">[];
  }, [selectedFee]);

  const isUndergrad = programType === "undergraduate";
  const jambRequired = isUndergrad && studentCategory === "new";
  const matricRequired = isUndergrad && studentCategory === "returning";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Simple validations
    const emailOk = /.+@.+\..+/.test(studentEmail);
    if (!studentName.trim()) return toast.warn("Enter your full name");
    if (!emailOk) return toast.warn("Enter a valid email address");
    if (!programType) return toast.warn("Select your program type");
    if (!programId) return toast.warn("Select your program");
    if (!selectedFeeId) return toast.warn("Select a fee to pay");
    if (jambRequired && !jambNumber.trim()) return toast.warn("JAMB number is required for new undergraduate students");
    if (matricRequired && !matricNumber.trim()) return toast.warn("Matric number is required for returning undergraduate students");
    if (gateway === "global") {
      if (!phoneNumber.trim()) return toast.warn("Phone number is required for GlobalPay");
      if (!/^\d{11}$/.test(phoneNumber.trim())) return toast.warn("Phone number must be exactly 11 digits");
      if (address && address.trim().length < 6) return toast.warn("Address must be at least 6 characters");
    }
    if (isUndergrad) {
      if (!level) return toast.warn("Select your level");
      if (!availableLevels.includes(level as Exclude<Level, "ALL">)) return toast.warn("Selected level is not applicable to this fee");
    }
    // Open confirmation modal before initiating payment
    setConfirmOpen(true);
  };

  // Initiate payment as soon as the confirm modal opens so the reference is available
  useEffect(() => {
    if (!confirmOpen) return;
    if (generatedReference) return; // avoid duplicate initiations within the same modal open
    (async () => {
      try {
        const result = await dispatch(
          initiatePayment({
            feeId: selectedFeeId!,
            studentEmail,
            studentName,
            gateway,
            jambNumber: jambNumber || undefined,
            matricNumber: matricNumber || undefined,
            level: isUndergrad ? level : undefined,
            percent,
            phoneNumber: phoneNumber || undefined,
            address: address || undefined,
          })
        ).unwrap();

        if (result.reference) {
          setGeneratedReference(result.reference);
          try {
            await navigator.clipboard.writeText(String(result.reference));
          } catch {}
        }

        const url = result.authorization_url ?? result.link;
        setInitiationUrl(url ?? null);
      } catch (err) {
        // errors are handled in slice/toast
      }
    })();
  }, [confirmOpen]);

  // Pre-checks to enable the Proceed button and provide inline guidance
  const emailOk = /.+@.+\..+/.test(studentEmail);
  const requiredFilled = Boolean(
    studentName.trim() && emailOk && programType && programId && (
      programType !== "undergraduate" || (level && (studentCategory === "new" ? jambNumber.trim() : matricNumber.trim()))
    )
  );
  const feeChosen = Boolean(selectedFeeId);
  const canProceed = requiredFilled && (!isUndergrad || !!level) && feeChosen;

  const onConfirmPayment = async () => {
    const url = initiationUrl;
    if (!url) {
      toast.error("Still preparing payment. Please wait...");
      return;
    }
    toast.success("Redirecting to payment gateway...");
    try {
      // Navigate in the same tab to avoid popup blockers preventing redirection
      window.location.href = url;
    } catch {
      window.location.assign(url);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      {/* Header */}
      <Header currentPage="payment" showThemeToggle={true} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Make a Payment
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Complete your payment securely and efficiently. Fill out the form below with your details and proceed to payment.
          </p>
        </div>



        {/* Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <form onSubmit={onSubmit} className="space-y-8 p-8">
            {/* Personal Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="e.g., john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number {gateway === "global" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="tel"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g., 08012345678"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, City, State"
                  />
                </div>
              </div>
            </div>

            {/* Program Selection */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Program Selection</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program Type</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                    value={programType}
                    onChange={(e) => {
                      const val = e.target.value as ProgramType | "";
                      setProgramType(val);
                      // reset dependent selections
                      setProgramId(undefined);
                      setSelectedFeeId(undefined);
                    }}
                  >
                    <option value="">Select type</option>
                    <option value="undergraduate">Undergraduate</option>
                    <option value="postgraduate">Postgraduate</option>
                    <option value="diploma">Diploma</option>
                    <option value="pre_degree">Pre-degree</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Program</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    value={programId ?? ""}
                    onChange={(e) => {
                      const id = Number(e.target.value) || undefined;
                      setProgramId(id);
                      setSelectedFeeId(undefined);
                    }}
                    disabled={!programType}
                  >
                    <option value="">{programType ? "Select program" : "Select program type first"}</option>
                    {programOptions.map((p) => (
                      <option key={p.program_id} value={p.program_id}>
                        {p.program_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Student Category and IDs */}
            {programType === "undergraduate" && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Undergraduate Details</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex gap-6">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={studentCategory === "new"} 
                        onChange={() => setStudentCategory("new")}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">New Student (JAMB)</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        checked={studentCategory === "returning"} 
                        onChange={() => setStudentCategory("returning")}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Returning Student (Matric)</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        JAMB Number {jambRequired && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        value={jambNumber}
                        onChange={(e) => setJambNumber(e.target.value)}
                        disabled={studentCategory !== "new"}
                        placeholder="e.g., 2024XXXXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Matric Number {matricRequired && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        value={matricNumber}
                        onChange={(e) => setMatricNumber(e.target.value)}
                        disabled={studentCategory !== "returning"}
                        placeholder="e.g., CSC/2020/1234"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level {isUndergrad && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
                      value={level ?? ""}
                      onChange={(e) => setLevel(e.target.value as Level)}
                    >
                      <option value="">Select your level</option>
                      {availableLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>{String(lvl).replace("L", "Level ")}</option>
                      ))}
                    </select>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Your level must match the fee&lsquo;s allowed levels; fees marked &ldquo;ALL&ldquo; accept any level in the department.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Fees for Program */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900/50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Fees</h2>
              </div>
              
              {!programId && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Select a program to view available fees</p>
                </div>
              )}
              
              {programId && feesStatus === "loading" && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-500 dark:text-gray-400">Loading fees...</p>
                </div>
              )}
              
              {programId && feesStatus === "succeeded" && fees.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No fees available for this program</p>
                </div>
              )}
              
              {programId && feesStatus === "succeeded" && isUndergrad && !level && fees.length > 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Select your level to view fees for this department</p>
                </div>
              )}
              
              {programId && feesStatus === "succeeded" && (!isUndergrad || !!level) && feesForLevel.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">No fees available for the selected level</p>
                </div>
              )}
              
              {programId && feesStatus === "succeeded" && (!isUndergrad || !!level) && feesForLevel.length > 0 && (
                <div className="space-y-3">
                  {feesForLevel.map((f) => (
                    <label 
                      key={f.fee_id} 
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                        selectedFeeId === f.fee_id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="radio"
                          name="fee"
                          checked={selectedFeeId === f.fee_id}
                          onChange={() => setSelectedFeeId(f.fee_id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">{f.fee_category}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Session: {f.session || "N/A"} • Semester: {f.semester || "N/A"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">₦{Number(f.amount).toLocaleString()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Total Amount</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Payment Options */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Option</h2>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={percent === 100} 
                      onChange={() => setPercent(100)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pay Full Amount (100%)</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      checked={percent === 50} 
                      onChange={() => setPercent(50)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pay Partial Amount (50%)</span>
                  </label>
                </div>
                {selectedFeeId && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Amount to pay:</span>
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">₦{payableAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Gateway */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Gateway</h2>
              </div>
              <div className="flex items-center p-4 rounded-lg border-2 border-green-600 bg-green-50 dark:bg-green-900/20">
                <div className="ml-1">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">GlobalPay</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Active payment gateway</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg flex items-center justify-center gap-2"
                disabled={initStatus === "loading" || !canProceed}
              >
                {initStatus === "loading" ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Proceed to Payment
                  </>
                )}
              </button>
              
              {payUrl && (
                <a 
                  href={payUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline text-sm"
                >
                  Continue if not redirected
                </a>
              )}
              
              {!canProceed && (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  Complete all required fields above to proceed with payment
                </p>
              )}
            </div>
            
            {paymentError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-600 dark:text-red-400">{paymentError}</p>
                </div>
              </div>
            )}
          </form>
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="w-full max-w-lg rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4">
              <h3 className="text-lg font-semibold mb-3">Confirm Payment</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-neutral-600 dark:text-neutral-400">Name:</span> {studentName}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Email:</span> {studentEmail}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Program Type:</span> {programType}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Program:</span> {programOptions.find(p => p.program_id === programId)?.program_name ?? "-"}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Fee:</span> {selectedFee?.fee_category ?? "-"}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Total Fee:</span> ₦{feeAmount.toLocaleString()}</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Paying:</span> {percent}% (₦{payableAmount.toLocaleString()})</p>
                <p><span className="text-neutral-600 dark:text-neutral-400">Gateway:</span> {gateway}</p>
                {isUndergrad && (
                  <p><span className="text-neutral-600 dark:text-neutral-400">{studentCategory === "new" ? "JAMB" : "Matric"}:</span> {studentCategory === "new" ? (jambNumber || "-") : (matricNumber || "-")}</p>
                )}
                {isUndergrad && (
                  <p><span className="text-neutral-600 dark:text-neutral-400">Level:</span> {level ? String(level).replace("L", "") : "-"}</p>
                )}
                {typeof payableAmount === "number" && (
                  <p><span className="text-neutral-600 dark:text-neutral-400">Amount:</span> ₦{payableAmount.toLocaleString()}</p>
                )}
                {generatedReference && (
                  <div className="mt-3 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 p-3">
                    <p className="text-sm font-semibold">Payment Reference</p>
                    <p className="font-mono text-sm break-all">{generatedReference}</p>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">Keep this reference safely; you can use it to retrieve your receipt.</p>
                  </div>
                )}
              </div>
              <div className="mt-4 flex gap-3 justify-end">
                <button
                  className="px-4 py-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-red-50 dark:hover:bg-neutral-800 transition-colors"
                  onClick={() => { setConfirmOpen(false); setGeneratedReference(null); setInitiationUrl(null); }}
                  disabled={initStatus === "loading"}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
                  onClick={onConfirmPayment}
                  disabled={initStatus === "loading" || !initiationUrl}
                >
                  {initStatus === "loading" || !initiationUrl ? "Preparing..." : "Confirm & Pay"}
                </button>
              </div>
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">You will be redirected to the payment gateway. Keep your Payment Reference for receipt retrieval after payment.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}