"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPrograms, type Program } from "@/store/programsSlice";
import {
  fetchFees,
  createFee,
  updateFee,
  deleteFee,
  type Fee,
  type Level,
} from "@/store/feesSlice";
import FeeModal from "@/components/admin/FeeModal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "react-toastify";

export default function AdminFeesPage() {
  const dispatch = useAppDispatch();
  const { items: programs, status: programStatus } = useAppSelector(
    (s) => s.programs
  );
  const {
    items: fees,
    status: feesStatus,
    saving,
    error,
    selectedProgramId,
  } = useAppSelector((s) => s.fees);

  const [programId, setProgramId] = useState<number | undefined>(
    selectedProgramId
  );
  const [programType, setProgramType] = useState<Program["program_type"] | "">(
    ""
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Fee | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Fee | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (programStatus === "idle") dispatch(fetchPrograms());
  }, [dispatch, programStatus]);

  useEffect(() => {
    if (feesStatus === "idle") dispatch(fetchFees());
  }, [dispatch, feesStatus]);

  const programOptions = useMemo(
    () =>
      programs
        .filter((p) => !programType || p.program_type === programType)
        .map((p) => ({ value: p.program_id, label: p.program_name })),
    [programs, programType]
  );

  useEffect(() => {
    if (programId) {
      const prog = programs.find((p) => p.program_id === programId);
      if (prog && programType && prog.program_type !== programType) {
        setProgramId(undefined);
      }
    }
  }, [programType, programId, programs]);

  const openAddModal = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEditModal = (fee: Fee) => {
    setEditing(fee);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: {
    program_id?: number;
    fee_category: string;
    amount: number;
    session?: string | null;
    semester?: string | null;
    levels?: Level[] | null;
  }) => {
    try {
      if (editing) {
        const { program_id: _ignored, ...updateData } = data;
        await dispatch(
          updateFee({ fee_id: editing.fee_id, ...updateData })
        ).unwrap();
        toast.success("Fee updated successfully");
      } else {
        if (!data.program_id) {
          toast.error("Please select a program in the modal");
          return;
        }
        await dispatch(
          createFee({
            program_id: data.program_id,
            fee_category: data.fee_category,
            amount: data.amount,
            session: data.session,
            semester: data.semester,
            levels: data.levels ?? [],
          })
        ).unwrap();
        toast.success("Fee created successfully");
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "Operation failed";
      toast.error(msg);
    }
  };

  const askDelete = (fee: Fee) => {
    setToDelete(fee);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteFee(toDelete.fee_id)).unwrap();
      toast.success("Fee deleted successfully");
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err instanceof Error
          ? err.message
          : "Delete failed";
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const selectedProgram = programs.find((p) => p.program_id === programId);

  const filteredFees = useMemo(() => {
    let list = fees;

    // Filter by program type
    if (programType) {
      list = list.filter((f) => {
        const prog = programs.find((p) => p.program_id === f.program_id);
        return prog?.program_type === programType;
      });
    }

    // Filter by program
    if (programId) {
      list = list.filter((f) => f.program_id === programId);
    }

    // Filter by search term
    if (searchTerm) {
      list = list.filter((f) => {
        const prog = programs.find((p) => p.program_id === f.program_id);
        return (
          f.fee_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prog?.program_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.amount.toString().includes(searchTerm) ||
          f.session?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.semester?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    return list;
  }, [fees, programType, programId, programs, searchTerm]);

  const totalFees = filteredFees.reduce(
    (sum, fee) => sum + Number(fee.amount),
    0
  );

  const programTypeStats = useMemo(() => {
    const stats = fees.reduce((acc, fee) => {
      const prog = programs.find((p) => p.program_id === fee.program_id);
      if (prog) {
        acc[prog.program_type] = (acc[prog.program_type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    return stats;
  }, [fees, programs]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-[#3b82f6] rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
              Fee Management
            </h1>
            <p className="text-sm sm:text-base text-white">
              Configure and manage program fees across all academic levels
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-3 bg-[#ff6447] hover:bg-[#ff4500] text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span>Add New Fee</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-2xl font-bold text-gray-900">{fees.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₦{totalFees.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Programs</p>
              <p className="text-2xl font-bold text-gray-900">
                {programs.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Filtered Results
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredFees.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-orange-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
          Filters & Search
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by category, program, amount..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* Program Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program Type
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={programType}
              onChange={(e) =>
                setProgramType(e.target.value as Program["program_type"] | "")
              }
            >
              <option value="">All Types</option>
              <option value="undergraduate">Undergraduate</option>
              <option value="postgraduate">Postgraduate</option>
              <option value="diploma">Diploma</option>
              <option value="pre_degree">Pre-degree</option>
            </select>
          </div>

          {/* Program Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Program
            </label>
            <select
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              value={programId ?? ""}
              onChange={(e) =>
                setProgramId(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
            >
              <option value="">All Programs</option>
              {programOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        {(programType || programId || searchTerm) && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="text-sm text-gray-600">
              Showing {filteredFees.length} of {fees.length} fees
            </p>
            <button
              onClick={() => {
                setProgramType("");
                setProgramId(undefined);
                setSearchTerm("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium text-left sm:text-right"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Fees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Fee Records
          </h2>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Program
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Session
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semester
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Levels
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {feesStatus === "loading" && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={8}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading fees...</span>
                    </div>
                  </td>
                </tr>
              )}
              {feesStatus === "failed" && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-red-600"
                    colSpan={8}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>{error ?? "Failed to load fees"}</span>
                    </div>
                  </td>
                </tr>
              )}
              {feesStatus === "succeeded" && filteredFees.length === 0 && (
                <tr>
                  <td
                    className="px-6 py-8 text-center text-gray-500"
                    colSpan={8}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <svg
                        className="w-12 h-12 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <p className="text-lg font-medium">No fees found</p>
                      <p className="text-sm">
                        Try adjusting your filters or add a new fee
                      </p>
                    </div>
                  </td>
                </tr>
              )}
              {feesStatus === "succeeded" &&
                filteredFees.map((f) => {
                  const prog = programs.find(
                    (p) => p.program_id === f.program_id
                  );
                  return (
                    <tr
                      key={f.fee_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {prog?.program_type?.replace("_", " ") ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {prog?.program_name ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {f.fee_category}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-green-600">
                        ₦{Number(f.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {f.session ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {f.semester ?? "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {Array.isArray(f.levels) && f.levels.length > 0 ? (
                          f.levels.includes("ALL") ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              All Levels
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Level{" "}
                              {f.levels
                                .map((l) => l.replace("L", ""))
                                .join(", ")}
                            </span>
                          )
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openEditModal(f)}
                            className="inline-flex items-center px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => askDelete(f)}
                            className="inline-flex items-center px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded-lg transition-colors"
                            disabled={saving}
                          >
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden">
          {feesStatus === "loading" && (
            <div className="p-6 text-center text-gray-500">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading fees...</span>
              </div>
            </div>
          )}
          {feesStatus === "failed" && (
            <div className="p-6 text-center text-red-600">
              <div className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{error ?? "Failed to load fees"}</span>
              </div>
            </div>
          )}
          {feesStatus === "succeeded" && filteredFees.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <div className="flex flex-col items-center space-y-2">
                <svg
                  className="w-12 h-12 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-lg font-medium">No fees found</p>
                <p className="text-sm">
                  Try adjusting your filters or add a new fee
                </p>
              </div>
            </div>
          )}
          {feesStatus === "succeeded" &&
            filteredFees.map((f) => {
              const prog = programs.find((p) => p.program_id === f.program_id);
              return (
                <div key={f.fee_id} className="border-b border-gray-200 p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {f.fee_category}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {prog?.program_name ?? "-"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          ₦{Number(f.amount).toLocaleString()}
                        </p>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {prog?.program_type?.replace("_", " ") ?? "-"}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Session:</span>
                        <p className="font-medium text-gray-900">
                          {f.session ?? "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Semester:</span>
                        <p className="font-medium text-gray-900">
                          {f.semester ?? "-"}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm">
                      <span className="text-gray-500">Levels:</span>
                      <div className="mt-1">
                        {Array.isArray(f.levels) && f.levels.length > 0 ? (
                          f.levels.includes("ALL") ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              All Levels
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Level{" "}
                              {f.levels
                                .map((l) => l.replace("L", ""))
                                .join(", ")}
                            </span>
                          )
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <button
                        onClick={() => openEditModal(f)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium rounded-lg transition-colors"
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => askDelete(f)}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-medium rounded-lg transition-colors"
                        disabled={saving}
                      >
                        <svg
                          className="w-4 h-4 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      <FeeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditing(null);
        }}
        programs={programs}
        onSubmit={handleSubmit}
        initialData={editing ?? undefined}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Fee"
        message={
          toDelete
            ? `Delete ${toDelete.fee_category} fee? This cannot be undone.`
            : "Delete this fee?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
