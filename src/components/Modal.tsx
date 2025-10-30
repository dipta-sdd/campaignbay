import { useState, useEffect, FC, ReactNode } from "react";
import { Button } from "@wordpress/components";
import { Icon, close } from "@wordpress/icons";

type ModalSize = "small" | "medium" | "large";

interface ModalProps {
  isOpen?: boolean;
  onRequestClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: ModalSize;
  shouldCloseOnOverlayClick?: boolean;
  shouldCloseOnEsc?: boolean;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  footer?: ReactNode;
}

const Modal: FC<ModalProps> = ({
  isOpen = true,
  onRequestClose,
  title,
  children,
  size = "large",
  shouldCloseOnOverlayClick = true,
  shouldCloseOnEsc = true,
  className = "",
  contentClassName = "",
  titleClassName = "",
  footer,
}) => {
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (shouldCloseOnEsc && event.key === "Escape") {
        onRequestClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onRequestClose, shouldCloseOnEsc]);

  if (!isMounted) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (shouldCloseOnOverlayClick && event.target === event.currentTarget) {
      onRequestClose();
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case "small":
        return "campaignbay-max-w-md";
      case "medium":
        return "campaignbay-max-w-2xl";
      case "large":
        return "campaignbay-max-w-4xl";
      default:
        return "campaignbay-max-w-2xl";
    }
  };

  const overlayClasses: string = `
    campaignbay-fixed campaignbay-inset-0 campaignbay-z-[9999] campaignbay-flex 
    campaignbay-items-center campaignbay-justify-center campaignbay-bg-black 
    campaignbay-bg-opacity-50 campaignbay-p-[4px] campaignbay-transition-opacity campaignbay-duration-300
    ${
      isOpen
        ? "campaignbay-opacity-100"
        : "campaignbay-opacity-0 campaignbay-pointer-events-none"
    }
  `;

  const modalClasses: string = `
    campaignbay-relative campaignbay-py-[24px] campaignbay-px-[32px] campaignbay-w-full 
    campaignbay-rounded-lg campaignbay-bg-white campaignbay-shadow-xl campaignbay-transform 
    campaignbay-transition-all campaignbay-duration-300
    ${getSizeClasses()} ${className}
    ${isOpen ? "campaignbay-scale-100" : "campaignbay-scale-95"}
  `;

  return (
    <div className={overlayClasses} onClick={handleOverlayClick}>
      <div
        className={modalClasses}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between  campaignbay-p-[4px]">
          <h3
            className={`campaignbay-text-lg campaignbay-font-semibold campaignbay-text-gray-800 campaignbay-pb-[8px] ${titleClassName}`}
          >
            {title}
          </h3>
          <Button
            onClick={onRequestClose}
            className="campaignbay-text-gray-500 hover:campaignbay-text-gray-700"
          >
            <Icon icon={close} />
          </Button>
        </div>
        <div className={`campaignbay-p-[8px] ${contentClassName}`}>
          {children}
        </div>
        {footer && (
          <div className="campaignbay-border-t campaignbay-border-gray-200 campaignbay-p-[4px]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
