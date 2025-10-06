"use client";
import { useEffect, useMemo, useState } from "react";
import type { Program } from "@/store/programsSlice";
import { 
  XMarkIcon, 
  AcademicCapIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { program_name: string; program_type: Program["program_type"] }) => void;
  initialData?: Partial<Program> | null;
};

const PROGRAM_TYPE_OPTIONS = [
  {
    value: "undergraduate",
    label: "Undergraduate",
    icon: BookOpenIcon,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "Bachelor's degree programs"
  },
  {
    value: "postgraduate",
    label: "Postgraduate",
    icon: AcademicCapIcon,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    description: "Master's and PhD programs"
  },
  {
    value: "diploma",
    label: "Diploma",
    icon: UserGroupIcon,
    color: "text-green-600",
    bgColor: "bg-green-50",
    description: "Professional diploma programs"
  },
  {
    value: "pre_degree",
    label: "Pre-degree",
    icon: DocumentTextIcon,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    description: "Foundation and preparatory programs"
  }
];

export default function ProgramModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [name, setName] = useState("");
  const [type, setType] = useState<Program["program_type"]>("undergraduate");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setName(initialData?.program_name ?? "");
    setType((initialData?.program_type as Program["program_type"]) ?? "undergraduate");
  }, [initialData]);

  const disabled = useMemo(() => name.trim().length < 3, [name]);

  const handleSubmit = async () => {
    if (disabled) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({ program_name: name.trim(), program_type: type });
      onClose();
    } catch (error) {
      console.error('Error submitting program:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTypeOption = PROGRAM_TYPE_OPTIONS.find(option => option.value === type);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200/60 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
                <AcademicCapIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {initialData?.program_id ? "Edit Program" : "Add New Program"}
                </h2>
                <p className="text-blue-100 text-sm">
                  {initialData?.program_id ? "Update program details" : "Create a new academic program"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <XMarkIcon className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Program Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              Program Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Computer Science, Business Administration"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 placeholder-gray-500"
                disabled={isSubmitting}
              />
              {name.trim().length >= 3 && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <CheckIcon className="h-4 w-4 text-green-500" />
                </div>
              )}
            </div>
            {name.trim().length > 0 && name.trim().length < 3 && (
              <p className="text-xs text-red-600">Program name must be at least 3 characters long</p>
            )}
          </div>

          {/* Program Type */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Program Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 gap-3">
              {PROGRAM_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = type === option.value;
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setType(option.value as Program["program_type"])}
                    disabled={isSubmitting}
                    className={`relative p-4 border-2 rounded-xl text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-blue-100' : option.bgColor
                      }`}>
                        <Icon className={`h-5 w-5 ${
                          isSelected ? 'text-blue-600' : option.color
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className={`font-medium ${
                            isSelected ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {option.label}
                          </h3>
                          {isSelected && (
                            <div className="h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                              <CheckIcon className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <p className={`text-sm mt-1 ${
                          isSelected ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Type Summary */}
          {selectedTypeOption && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${selectedTypeOption.bgColor}`}>
                  <selectedTypeOption.icon className={`h-4 w-4 ${selectedTypeOption.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Selected: {selectedTypeOption.label}</p>
                  <p className="text-xs text-gray-600">{selectedTypeOption.description}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={disabled || isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>{initialData?.program_id ? "Save Changes" : "Create Program"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}