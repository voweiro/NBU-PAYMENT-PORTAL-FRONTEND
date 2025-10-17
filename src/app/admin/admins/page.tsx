"use client";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/store";
import { fetchAdmins, createAdmin, updateAdmin, deleteAdmin, type Admin } from "@/store/adminsSlice";
import AdminModal from "@/components/admin/AdminModal";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { toast } from "react-toastify";
import { 
  UserPlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  UsersIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function AdminsPage() {
  const dispatch = useAppDispatch();
  const { items: admins, status, saving, error } = useAppSelector((s) => s.admins);
  const token = useAppSelector((s) => s.auth.token);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Admin | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "super_admin">("all");

  // Helper functions for styling
  const getRoleColor = (role: Admin["role"]) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800";
      case "admin":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: Admin["role"]) => {
    switch (role) {
      case "super_admin":
        return <ShieldCheckIcon className="w-4 h-4" />;
      case "admin":
        return <UserIcon className="w-4 h-4" />;
      default:
        return <UserIcon className="w-4 h-4" />;
    }
  };

  // Filter admins based on search and role filter
  const filteredAdmins = useMemo(() => {
    return admins.filter(admin => {
      const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           admin.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === "all" || admin.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [admins, searchQuery, roleFilter]);

  // Admin statistics
  const adminStats = useMemo(() => {
    const total = admins.length;
    const superAdmins = admins.filter(a => a.role === "super_admin").length;
    const regularAdmins = admins.filter(a => a.role === "admin").length;
    
    return {
      total,
      superAdmins,
      regularAdmins
    };
  }, [admins]);

  useEffect(() => {
    if (token && status === "idle") {
      dispatch(fetchAdmins()).unwrap().catch(() => {});
    }
  }, [dispatch, token, status]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const openAdd = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (admin: Admin) => {
    setEditing(admin);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSubmit = async (data: { name: string; email?: string; role: Admin["role"]; password?: string }) => {
    try {
      if (editing) {
        await dispatch(updateAdmin({ admin_id: editing.admin_id, name: data.name, role: data.role, password: data.password })).unwrap();
        toast.success("Admin updated");
      } else {
        if (!data.email) {
          toast.error("Email is required");
          return;
        }
        await dispatch(createAdmin({ name: data.name, email: data.email, role: data.role, password: data.password ?? "" })).unwrap();
        toast.success("Admin created");
      }
      closeModal();
    } catch (err) {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Operation failed";
      toast.error(msg);
    }
  };

  const askDelete = (admin: Admin) => {
    setToDelete(admin);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await dispatch(deleteAdmin(toDelete.admin_id)).unwrap();
      toast.success("Admin deleted");
    } catch (err) {
      const msg = typeof err === "string" ? err : err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
      setToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Management</h1>
            <p className="text-sm text-gray-600">Manage administrator accounts and permissions</p>
          </div>
        </div>
        <button 
          onClick={openAdd} 
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-lg transition-all duration-200 transform hover:scale-105"
        >
          <UserPlusIcon className="w-5 h-5" />
          <span>Add Admin</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Admins</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Super Admins</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.superAdmins}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Regular Admins</p>
              <p className="text-3xl font-bold text-gray-900">{adminStats.regularAdmins}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search admins by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="sm:w-48">
            <div className="relative">
              <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "super_admin")}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Loading State */}
        {status === "loading" && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-600">Loading admins...</span>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "failed" && error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">Failed to load admins</p>
              <p className="text-gray-500 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {status === "succeeded" && filteredAdmins.length === 0 && admins.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No admins found</p>
              <p className="text-gray-500 text-sm mt-1">Get started by adding your first admin</p>
              <button 
                onClick={openAdd}
                className="mt-4 inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <UserPlusIcon className="w-4 h-4" />
                <span>Add First Admin</span>
              </button>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {status === "succeeded" && filteredAdmins.length === 0 && admins.length > 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No admins match your search</p>
              <p className="text-gray-500 text-sm mt-1">Try adjusting your search terms or filters</p>
            </div>
          </div>
        )}

        {/* Table Content */}
        {status === "succeeded" && filteredAdmins.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4" />
                      <span>Admin</span>
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <ShieldCheckIcon className="w-4 h-4" />
                      <span>Role</span>
                    </div>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">
                    <div className="flex items-center space-x-2">
                      <CalendarDaysIcon className="w-4 h-4" />
                      <span>Created</span>
                    </div>
                  </th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.admin_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-sm">
                            {admin.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{admin.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600">{admin.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${getRoleColor(admin.role)}`}>
                        {getRoleIcon(admin.role)}
                        <span className="capitalize">{admin.role.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-600 text-sm">
                        {admin.created_at ? new Date(admin.created_at).toLocaleDateString() : "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEdit(admin)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-colors"
                          title="Edit Admin"
                        >
                          <PencilIcon className="w-4 h-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => askDelete(admin)}
                          disabled={saving}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete Admin"
                        >
                          <TrashIcon className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Saving Indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Saving changes...</span>
        </div>
      )}

      <AdminModal isOpen={isModalOpen} onClose={closeModal} onSubmit={handleSubmit} initialData={editing ?? undefined} />

      <ConfirmModal
        isOpen={confirmOpen}
        title="Delete Admin"
        message={toDelete ? `Delete admin \"${toDelete.name}\" (${toDelete.email})? This cannot be undone.` : "Delete this admin?"}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setToDelete(null); }}
      />
    </div>
  );
}