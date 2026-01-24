import React from "react";
import Button from "./Button";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
}) => {
  if (!isOpen) return null;

  return (
    <div className="campaignbay-fixed campaignbay-inset-0 campaignbay-z-[60] campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-bg-black/50 campaignbay-backdrop-blur-sm campaignbay-transition-opacity">
      <div className="campaignbay-bg-white campaignbay-rounded-lg campaignbay-shadow-xl campaignbay-p-6 campaignbay-max-w-sm campaignbay-w-full campaignbay-mx-4 campaignbay-transform campaignbay-transition-all campaignbay-scale-100">
        <h3 className="campaignbay-text-lg campaignbay-font-bold campaignbay-text-gray-900 campaignbay-mb-2">
          {title}
        </h3>
        <p className="campaignbay-text-gray-600 campaignbay-mb-6 campaignbay-text-sm campaignbay-leading-relaxed">
          {message}
        </p>
        <div className="campaignbay-flex campaignbay-justify-end campaignbay-gap-3">
          <Button variant="outline" color="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="solid" color="primary" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
