import { useEffect, FC, ReactNode } from "react";
import { __ } from "@wordpress/i18n";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  children: ReactNode;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmDialog: FC<ConfirmDialogProps> = ({
  isOpen,
  title = __("Confirm Action", "campaignbay"),
  onConfirm,
  onCancel,
  children,
  confirmText = __("Confirm", "campaignbay"),
  cancelText = __("Cancel", "campaignbay"),
}) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="campaignbay-fixed campaignbay-inset-0 campaignbay-z-50 campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-bg-gray-900/75"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div
        className="campaignbay-relative campaignbay-w-full campaignbay-max-w-[448px] campaignbay-p-[4px] campaignbay-mx-[16px] campaignbay-bg-white campaignbay-rounded-[10px] campaignbay-shadow-xl"
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="campaignbay-flex campaignbay-items-start campaignbay-justify-between campaignbay-p-[16px] campaignbay-border-b campaignbay-border-gray-200">
          <h2
            id="confirm-dialog-title"
            className="campaignbay-text-[18px] campaignbay-font-semibold campaignbay-text-gray-800"
          >
            {title}
          </h2>
          <button
            onClick={onCancel}
            className="campaignbay-p-[4px] campaignbay-text-gray-400 campaignbay-rounded-full hover:campaignbay-bg-gray-100 hover:campaignbay-text-gray-600 focus:campaignbay-outline-none focus:campaignbay-ring-[2px] focus:campaignbay-ring-blue-500"
            aria-label={__("Close dialog", "campaignbay")}
          >
            <X size={20} />
          </button>
        </div>
        <div className="campaignbay-p-[20px] campaignbay-text-gray-700">
          {children}
        </div>
        <div className="campaignbay-flex campaignbay-justify-end campaignbay-p-[16px] campaignbay-space-x-[12px] campaignbay-border-t campaignbay-border-gray-200">
          <button
            onClick={onCancel}
            className="campaignbay-px-[16px] campaignbay-py-[8px] campaignbay-text-[14px] campaignbay-font-medium campaignbay-text-gray-700 campaignbay-bg-white campaignbay-border campaignbay-border-gray-300 campaignbay-rounded-[6px] campaignbay-shadow-sm hover:campaignbay-bg-gray-50 focus:campaignbay-outline-none focus:campaignbay-ring-[2px] focus:campaignbay-ring-offset-[2px] focus:campaignbay-ring-gray-500"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="campaignbay-px-[16px] campaignbay-py-[8px] campaignbay-text-[14px] campaignbay-font-medium campaignbay-text-white campaignbay-bg-red-600 campaignbay-border campaignbay-border-transparent campaignbay-rounded-[6px] campaignbay-shadow-sm hover:campaignbay-bg-red-700 focus:campaignbay-outline-none focus:campaignbay-ring-[2px] focus:campaignbay-ring-offset-[2px] focus:campaignbay-ring-red-500"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
