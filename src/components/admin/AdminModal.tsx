"use client";
import { useEffect, useMemo, useState } from "react";
import type { Admin } from "@/store/adminsSlice";
import { 
  XMarkIcon, 
  UserIcon, 
  EnvelopeIcon, 
  ShieldCheckIcon, 
  LockClosedIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; email?: string; role: Admin["role"]; password?: string }) => void | Promise<void>;
  initialData?: Partial<Admin> | null;
};

export default function AdminModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Admin["role"]>("admin");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(initialData?.name ?? "");
    setEmail(initialData?.email ?? "");
    setRole((initialData?.role as Admin["role"]) ?? "admin");
    setPassword("");
    setIsSubmitting(false);
  }, [initialData]);

  const isEditing = Boolean(initialData?.admin_id);
  const isEmailValid = useMemo(() => /.+@.+\..+/.test(email), [email]);
  const isPasswordValid = useMemo(() => password.length >= 6, [password]);
  const isNameValid = useMemo(() => name.trim().length >= 2, [name]);
  
  const disabled = useMemo(() => {
    const nameOk = isNameValid;
    const roleOk = role === "admin" || role === "super_admin";
    const passwordOk = isEditing ? true : isPasswordValid;
    const emailOk = isEditing ? true : isEmailValid;
    return !(nameOk && roleOk && passwordOk && emailOk) || isSubmitting;
  }, [isNameValid, role, isPasswordValid, isEditing, isEmailValid, isSubmitting]);

  if (!isOpen) return null;

  const submit = async () => {
    if (disabled) return;
    
    setIsSubmitting(true);
    try {
      const payload: { name: string; email?: string; role: Admin["role"]; password?: string } = {
        name: name.trim(),
        role,
      };
      if (!isEditing) payload.email = email.trim();
      if (password) payload.password = password;
      await onSubmit(payload);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div 
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <UserIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">
                  {isEditing ? "Edit Admin" : "Add New Admin"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditing ? "Update admin information" : "Create a new admin account"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Close modal"
            >
              <XMarkIcon className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <UserIcon className="w-4 h-4" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                name && !isNameValid
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              autoFocus={!isEditing}
            />
            {name && !isNameValid && (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>Name must be at least 2 characters long</span>
              </div>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <EnvelopeIcon className="w-4 h-4" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                isEditing
                  ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed'
                  : email && !isEmailValid
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              disabled={isEditing}
            />
            {!isEditing && email && !isEmailValid && (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>Please enter a valid email address</span>
              </div>
            )}
            {isEditing && (
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Email cannot be changed after creation</span>
              </div>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <ShieldCheckIcon className="w-4 h-4" />
              <span>Role</span>
            </label>
            <select
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={role}
              onChange={(e) => setRole(e.target.value as Admin["role"])}
            >
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {role === "super_admin" 
                ? "Full access to all admin features and user management"
                : "Standard admin access with limited permissions"
              }
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              <LockClosedIcon className="w-4 h-4" />
              <span>{isEditing ? "New Password (Optional)" : "Password"}</span>
            </label>
            <input
              type="password"
              className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                !isEditing && password && !isPasswordValid
                  ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isEditing ? "Leave blank to keep current password" : "Enter password (min. 6 characters)"}
            />
            {!isEditing && password && !isPasswordValid && (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400 text-xs">
                <ExclamationTriangleIcon className="w-3 h-3" />
                <span>Password must be at least 6 characters long</span>
              </div>
            )}
            {isEditing && (
              <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400 text-xs">
                <CheckCircleIcon className="w-3 h-3" />
                <span>Leave empty to keep the current password</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={disabled}
            className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-all ${
              disabled
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </div>
            ) : (
              isEditing ? "Save Changes" : "Create Admin"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}