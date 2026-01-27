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
  classNames?: {
    overlay?: string;
    content?: string;
    title?: string;
    message?: string;
    footer?: string;
    button?: {
      cancelClassName?: string;
      confirmClassName?: string;
      cancelVariant?: "solid" | "outline" | "ghost";
      confirmVariant?: "solid" | "outline" | "ghost";
      cancelColor?: "primary" | "secondary" | "danger";
      confirmColor?: "primary" | "secondary" | "danger";
    }
  };
}
export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  classNames = {},
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`campaignbay-fixed campaignbay-inset-0 campaignbay-z-[60000] campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-bg-black/50 campaignbay-backdrop-blur-sm campaignbay-transition-opacity ${
        classNames.overlay || ""
      }`}
    >
      <div
        className={`campaignbay-bg-white campaignbay-rounded-lg campaignbay-shadow-xl campaignbay-p-6 campaignbay-max-w-sm campaignbay-w-full campaignbay-mx-4 campaignbay-transform campaignbay-transition-all campaignbay-scale-100 ${
          classNames.content || ""
        }`}
      >
        <h3
          className={`campaignbay-text-lg campaignbay-font-bold campaignbay-text-gray-900 campaignbay-mb-2 ${
            classNames.title || ""
          }`}
        >
          {title}
        </h3>
        <p
          className={`campaignbay-text-gray-600 campaignbay-mb-6 campaignbay-text-sm campaignbay-leading-relaxed ${
            classNames.message || ""
          }`}
        >
          {message}
        </p>
        <div
          className={`campaignbay-flex campaignbay-justify-end campaignbay-gap-3 ${
            classNames.footer || ""
          }`}
        >
          <Button className={classNames.button?.cancelClassName || ""} variant={classNames.button?.cancelVariant || "ghost"} color={classNames.button?.cancelColor || "secondary"} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button className={classNames.button?.confirmClassName || ""} variant={classNames.button?.confirmVariant || "solid"} color={classNames.button?.confirmColor || "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};
