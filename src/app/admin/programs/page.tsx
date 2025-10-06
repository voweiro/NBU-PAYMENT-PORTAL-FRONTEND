"use client";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchPrograms, createProgram, updateProgram, deleteProgram, type Program } from "@/store/programsSlice";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "react-toastify";
import ProgramModal from "@/components/admin/ProgramModal";
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

export default function AdminProgramsPage() {
  const dispatch = useAppDispatch();
  const { items, status, saving, error } = useAppSelector((s) => s.programs);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Program | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    if (status === "idle") dispatch(fetchPrograms());
  }, [dispatch, status]);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    let result = items;
    if (s) {
      result = result.filter((p) => p.program_name.toLowerCase().includes(s) || p.program_type.toLowerCase().includes(s));
    }
    if (typeFilter) {
      result = result.filter((p) => p.program_type === typeFilter);
    }
    return result;
  }, [items, search, typeFilter]);

  const programStats = useMemo(() => {
    const totalPrograms = items.length;
    const undergraduateCount = items.filter(p => p.program_type === 'undergraduate').length;
    const postgraduateCount = items.filter(p => p.program_type === 'postgraduate').length;
    const diplomaCount = items.filter(p => p.program_type === 'diploma').length;
    
    return {
      total: totalPrograms,
      undergraduate: undergraduateCount,
      postgraduate: postgraduateCount,
      diploma: diplomaCount
    };
  }, [items]);

  const programTypes = useMemo(() => {
    return [...new Set(items.map(program => program.program_type))];
  }, [items]);

  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (program: Program) => {
    setEditing(program);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data: { program_name: string; program_type: Program["program_type"] }) => {
    try {
      if (editing) {
        await dispatch(updateProgram({ program_id: editing.program_id, ...data })).unwrap();
        toast.success("Program updated");
      } else {
        await dispatch(createProgram(data)).unwrap();
        toast.success("Program created");
      }
      closeModal();
    } catch (err) {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Action failed";
      toast.error(msg);
    }
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Program | null>(null);

  const askDelete = (program: Program) => {
    setToDelete(program);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteProgram(toDelete.program_id)).unwrap();
      toast.success("Program deleted");
    } catch (err) {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'undergraduate':
        return 'bg-university-blue-light text-university-blue border-university-blue-light';
      case 'postgraduate':
        return 'bg-university-red-light text-university-red border-university-red-light';
      case 'diploma':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'undergraduate':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'postgraduate':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'diploma':
        return <UserGroupIcon className="h-4 w-4" />;
      default:
        return <ChartBarIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-university-blue-light via-white to-university-red-light">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-university-blue-light p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-university-red mb-2">Programs Management</h1>
              <p className="text-university-blue">Manage academic programs and their types</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={openAdd}
                className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-university-red to-university-red-dark text-white text-sm font-medium rounded-lg hover:from-university-red-dark hover:to-university-red focus:ring-2 focus:ring-university-red focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Program
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg border border-university-blue-light p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-university-blue">Total Programs</p>
                <p className="text-2xl font-bold text-university-red mt-1">{programStats.total}</p>
              </div>
              <div className="h-12 w-12 bg-university-blue-light rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-university-blue" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-university-blue-light p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-university-blue">Undergraduate</p>
                <p className="text-2xl font-bold text-university-red mt-1">{programStats.undergraduate}</p>
              </div>
              <div className="h-12 w-12 bg-university-blue-light rounded-lg flex items-center justify-center">
                <BookOpenIcon className="h-6 w-6 text-university-blue" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-university-red-light p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-university-blue">Postgraduate</p>
                <p className="text-2xl font-bold text-university-red mt-1">{programStats.postgraduate}</p>
              </div>
              <div className="h-12 w-12 bg-university-red-light rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-6 w-6 text-university-red" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-university-blue">Diploma</p>
                <p className="text-2xl font-bold text-university-red mt-1">{programStats.diploma}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserGroupIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg border border-university-blue-light p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-university-blue" />
                <input
                  type="text"
                  placeholder="Search programs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-university-blue-light rounded-lg focus:ring-2 focus:ring-university-blue focus:border-university-blue transition-colors"
                />
              </div>
              
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-university-blue" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="pl-10 pr-8 py-2.5 border border-university-blue-light rounded-lg focus:ring-2 focus:ring-university-blue focus:border-university-blue transition-colors appearance-none bg-white min-w-[150px]"
                >
                  <option value="">All Types</option>
                  {programTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="text-sm text-university-blue">
              Showing {filtered.length} of {items.length} programs
            </div>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-xl shadow-lg border border-university-blue-light overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-university-blue-light to-university-red-light border-b border-university-blue-light">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-university-blue uppercase tracking-wider">
                    Program Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-university-blue uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-university-blue uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-university-blue-light">
                {status === "loading" && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-university-blue mb-4"></div>
                        <p className="text-university-blue font-medium">Loading programs...</p>
                      </div>
                    </td>
                  </tr>
                )}
                {status === "failed" && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 bg-university-red-light rounded-lg flex items-center justify-center">
                          <ChartBarIcon className="h-6 w-6 text-university-red" />
                        </div>
                        <p className="text-university-red font-medium">Failed to load programs</p>
                        <p className="text-university-blue text-sm mt-1">Please try refreshing the page</p>
                      </div>
                    </td>
                  </tr>
                )}
                {status === "succeeded" && filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-12 w-12 bg-university-blue-light rounded-lg flex items-center justify-center">
                          <BookOpenIcon className="h-6 w-6 text-university-blue" />
                        </div>
                        <p className="text-university-blue font-medium">No programs found</p>
                        <p className="text-gray-400 text-sm mt-1">
                          {search || typeFilter ? 'Try adjusting your filters' : 'Get started by adding your first program'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
                {filtered.map((p) => (
                  <tr key={p.program_id} className="hover:bg-university-blue-light/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center mr-3 ${getTypeColor(p.program_type)}`}>
                          {getTypeIcon(p.program_type)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-university-red">{p.program_name}</div>
                          <div className="text-xs text-university-blue">Academic Program</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(p.program_type)}`}>
                        {getTypeIcon(p.program_type)}
                        <span className="ml-1.5 capitalize">{p.program_type.replace("_", " ")}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-university-blue bg-university-blue-light border border-university-blue rounded-lg hover:bg-university-blue hover:text-white focus:ring-2 focus:ring-university-blue focus:ring-offset-1 transition-colors"
                        >
                          <PencilIcon className="h-3 w-3 mr-1" />
                          Edit
                        </button>
                        <button
                          onClick={() => askDelete(p)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-university-red bg-university-red-light border border-university-red rounded-lg hover:bg-university-red hover:text-white focus:ring-2 focus:ring-university-red focus:ring-offset-1 transition-colors"
                        >
                          <TrashIcon className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {saving && (
          <div className="bg-white rounded-xl shadow-lg border border-university-blue-light p-4">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-university-blue mr-2"></div>
              <p className="text-sm text-university-blue">Saving changes...</p>
            </div>
          </div>
        )}
      </div>

      <ProgramModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        initialData={editing}
      />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Program"
        message={`Delete program "${toDelete?.program_name ?? ""}"? This cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setToDelete(null);
        }}
      />
    </div>
  );
}