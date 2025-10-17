"use client";
import { useEffect, useMemo, useState } from "react";
import type { Fee, Level } from "@/store/feesSlice";
import type { Program } from "@/store/programsSlice";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  programs: Program[];
  onSubmit: (data: { program_id?: number; fee_category: string; amount: number; session?: string; semester?: string; levels?: Level[] | null }) => void | Promise<void>;
  initialData?: Partial<Fee> | null;
};

export default function FeeModal({ isOpen, onClose, programs, onSubmit, initialData }: Props) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [session, setSession] = useState<string>("");
  const [semester, setSemester] = useState<string>("");
  const [selectedType, setSelectedType] = useState<Program["program_type"] | "">("");
  const [selectedProgramId, setSelectedProgramId] = useState<number | undefined>(undefined);
  const [levels, setLevels] = useState<Level[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const LEVEL_OPTIONS: { value: Level; label: string; icon: string }[] = useMemo(() => ([
    { value: "L100", label: "Level 100", icon: "🎓" },
    { value: "L200", label: "Level 200", icon: "📚" },
    { value: "L300", label: "Level 300", icon: "📖" },
    { value: "L400", label: "Level 400", icon: "🎯" },
    { value: "L500", label: "Level 500", icon: "🏆" },
    { value: "L600", label: "Level 600", icon: "👨‍🎓" },
    { value: "ALL", label: "All Levels", icon: "🌟" },
  ]), []);

  const PROGRAM_TYPE_OPTIONS = [
    { value: "undergraduate", label: "Undergraduate", icon: "🎓", color: "bg-blue-50 text-blue-700 border-blue-200" },
    { value: "postgraduate", label: "Postgraduate", icon: "👨‍🎓", color: "bg-purple-50 text-purple-700 border-purple-200" },
    { value: "diploma", label: "Diploma", icon: "📜", color: "bg-green-50 text-green-700 border-green-200" },
    { value: "pre_degree", label: "Pre-degree", icon: "📚", color: "bg-orange-50 text-orange-700 border-orange-200" },
  ];

  useEffect(() => {
    setCategory(initialData?.fee_category ?? "");
    setAmount(
      initialData?.amount !== undefined && initialData?.amount !== null
        ? String(initialData.amount)
        : ""
    );
    setSession(initialData?.session ?? "");
    setSemester(initialData?.semester ?? "");
    setLevels(Array.isArray(initialData?.levels) ? (initialData?.levels as Level[]) : []);
    if (initialData?.program_id) {
      const prog = programs.find((p) => p.program_id === initialData.program_id);
      if (prog) {
        setSelectedType(prog.program_type);
        setSelectedProgramId(prog.program_id);
      }
    } else {
      setSelectedType("");
      setSelectedProgramId(undefined);
    }
  }, [initialData, programs]);

  const isEditing = Boolean(initialData?.fee_id);
  const filteredPrograms = useMemo(() => programs.filter((p) => !selectedType || p.program_type === selectedType), [programs, selectedType]);

  const disabled = useMemo(() => {
    const amt = Number(amount);
    const requireProgram = !isEditing;
    return (
      category.trim().length < 2 ||
      isNaN(amt) ||
      amt <= 0 ||
      (requireProgram && !selectedProgramId) ||
      (selectedType === "undergraduate" && levels.length === 0)
    );
  }, [category, amount, isEditing, selectedProgramId, selectedType, levels]);

  if (!isOpen) return null;

  const submit = async () => {
    if (disabled || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const amt = Number(amount);
      await onSubmit({
        program_id: selectedProgramId,
        fee_category: category.trim(),
        amount: amt,
        session: session || undefined,
        semester: semester || undefined,
        levels: selectedType === "undergraduate" ? (levels.length ? levels : []) : [],
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? '' : num.toLocaleString();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg">💰</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? "Edit Fee" : "Add New Fee"}
                </h2>
                <p className="text-sm text-gray-500">
                  {isEditing ? "Update fee information" : "Create a new fee for the selected program"}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <span className="text-gray-500">✕</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Program Selection Section */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              🎯 Program Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program Type *
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as Program["program_type"])}
                  disabled={isEditing}
                >
                  <option value="">Select program type</option>
                  {PROGRAM_TYPE_OPTIONS.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
                {isEditing && (
                  <p className="text-xs text-amber-600 mt-1">
                    ⚠️ Program type cannot be changed when editing
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program *
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  value={selectedProgramId ?? ""}
                  onChange={(e) => setSelectedProgramId(e.target.value ? Number(e.target.value) : undefined)}
                  disabled={isEditing || !selectedType}
                >
                  <option value="">Select program</option>
                  {filteredPrograms.map((p) => (
                    <option key={p.program_id} value={p.program_id}>
                      {p.program_name}
                    </option>
                  ))}
                </select>
                {!selectedType && (
                  <p className="text-xs text-gray-500 mt-1">
                    Please select a program type first
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Level Selection for Undergraduate */}
          {selectedType === "undergraduate" && (
            <div className="bg-blue-50 rounded-xl p-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Applicable Levels *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {LEVEL_OPTIONS.map((opt) => {
                  const checked = levels.includes(opt.value);
                  const isAllSelected = levels.includes("ALL");
                  const disabledOpt = isAllSelected && opt.value !== "ALL";
                  return (
                    <label 
                      key={opt.value} 
                      className={`
                        flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all
                        ${checked 
                          ? "border-blue-500 bg-blue-50 text-blue-700" 
                          : "border-gray-200 hover:border-gray-300"
                        }
                        ${disabledOpt ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabledOpt}
                        onChange={(e) => {
                          const isChecked = e.target.checked;
                          if (opt.value === "ALL") {
                            setLevels(isChecked ? ["ALL"] : []);
                          } else {
                            setLevels((prev) => {
                              const next = new Set(prev);
                              next.delete("ALL");
                              if (isChecked) next.add(opt.value);
                              else next.delete(opt.value);
                              return Array.from(next) as Level[];
                            });
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-lg">{opt.icon}</span>
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-blue-600 mt-2">
                💡 Select specific levels or choose &quot;All Levels&quot; to apply to all undergraduate levels
              </p>
            </div>
          )}

          {/* Fee Details Section */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              💰 Fee Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fee Category *
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Tuition Fee, Acceptance Fee, Lab Fee"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (NGN) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₦</span>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 pl-8 pr-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    value={formatAmount(amount)}
                    onChange={(e) => {
                      const value = e.target.value.replace(/,/g, '');
                      if (/^\d*\.?\d*$/.test(value)) {
                        setAmount(value);
                      }
                    }}
                    placeholder="150,000"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Academic Session
                </label>
                <input
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  placeholder="e.g. 2024/2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                >
                  <option value="">Select semester</option>
                  <option value="First">First Semester</option>
                  <option value="Second">Second Semester</option>
                  <option value="Both">Both Semesters</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button 
              onClick={onClose} 
              className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              disabled={disabled || isSubmitting}
              onClick={submit}
              className={`
                px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2
                ${disabled || isSubmitting
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed" 
                  : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                <>
                  {isEditing ? "💾 Save Changes" : "➕ Add Fee"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}