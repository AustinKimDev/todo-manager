import React, { useEffect } from "react";

// --- Interfaces ---
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

// Reusable Modal Component (Styled for Glassmorphism)
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-400", // Tailwind Semantic Color
}) => {
  // useEffect hook moved to the top level
  useEffect(() => {
    if (!isOpen) return; // Exit early if not open

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]); // Add isOpen dependency

  if (!isOpen) return null; // Render null if not open

  return (
    // Backdrop with blur
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* Modal Panel with glass effect */}
      <div
        className="bg-gray-700/60 backdrop-blur-lg border border-gray-500/30 rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 text-gray-100 transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold leading-6 text-white mb-4">
          {title}
        </h3>
        <div className="mt-2 text-sm text-gray-200">{children}</div>
        {/* Action Buttons */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-500/50 bg-gray-600/50 px-4 py-2 text-sm font-medium text-gray-200 shadow-sm hover:bg-gray-500/60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-gray-400" // Tailwind Semantic Color
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`inline-flex justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 ${confirmButtonClass}`} // Base classes + prop
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
