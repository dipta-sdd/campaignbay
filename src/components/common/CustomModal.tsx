import React, { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface CustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  closeOnOutsideClick?: boolean;
  className?: string;
  showHeader?: boolean;
  classNames?: {
    header?: string;
    body?: string;
    footer?: string;
  }
}

const CustomModal: React.FC<CustomModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = "campaignbay-max-w-2xl",
  closeOnOutsideClick = true,
  className = "",
  showHeader = true,
  classNames = {
    header: "",
    body: "",
    footer: "",
  }
}) => {
  // Handle Escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
      // Prevent scrolling on body when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="campaignbay-fixed campaignbay-inset-0 campaignbay-z-[9998] campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-p-4 campaignbay-bg-black/75 campaignbay-transition-opacity campaignbay-duration-300">
      {/* Backdrop click handler */}
      <div
        className="campaignbay-absolute campaignbay-inset-0"
        onClick={closeOnOutsideClick ? onClose : undefined}
      />

      {/* Modal Content */}
      <div
        className={`
          campaignbay-relative campaignbay-w-full ${maxWidth} 
          campaignbay-bg-white campaignbay-shadow-2xl campaignbay-rounded-xl 
          campaignbay-flex campaignbay-flex-col campaignbay-max-h-[90vh]
          campaignbay-animate-in campaignbay-fade-in campaignbay-zoom-in-95 campaignbay-duration-200
          ${className}
        `}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {showHeader && (
          <div className={`campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-px-6 campaignbay-py-4 campaignbay-border-b campaignbay-border-gray-100 ${classNames.header}`}>
            <h3 className="campaignbay-text-lg campaignbay-font-semibold campaignbay-text-gray-900">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="campaignbay-p-1.5 campaignbay-text-gray-400 hover:campaignbay-text-gray-600 campaignbay-transition-colors hover:campaignbay-bg-gray-100 campaignbay-rounded-full"
              aria-label="Close modal"
            >
              <X className="campaignbay-w-5 campaignbay-h-5" />
            </button>
          </div>
        )}

        {/* Body */}
        <div className={`campaignbay-p-6 campaignbay-overflow-y-auto campaignbay-flex-1 ${classNames.body}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className={`campaignbay-flex campaignbay-items-center campaignbay-justify-end campaignbay-gap-3 campaignbay-px-6 campaignbay-py-4 campaignbay-bg-gray-50 campaignbay-border-t campaignbay-border-gray-100 campaignbay-rounded-b-xl ${classNames.footer}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default CustomModal;
