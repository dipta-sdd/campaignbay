import { useState, useEffect } from "@wordpress/element";
import { Button } from "@wordpress/components";
import { Icon, close } from "@wordpress/icons";

const Modal = ({
  isOpen = true,
  onRequestClose,
  title,
  children,
  size = "large", // 'small', 'medium', 'large'
  shouldCloseOnOverlayClick = true,
  shouldCloseOnEsc = true,
  className = "",
  contentClassName = "",
  titleClassName = "",
  footer, // Optional: ReactNode for custom footer
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      document.body.style.overflow = "hidden"; // Prevent scrolling when modal is open
    } else {
      document.body.style.overflow = ""; // Restore scrolling
      // Delay unmounting to allow exit animation if any
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = ""; // Ensure scrolling is restored on unmount
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event) => {
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

  const handleOverlayClick = (event) => {
    if (shouldCloseOnOverlayClick && event.target === event.currentTarget) {
      onRequestClose();
    }
  };

  const getSizeClasses = () => {
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

  return (
    <div
      className={`campaignbay-fixed campaignbay-inset-0 campaignbay-z-[9999] campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-bg-black campaignbay-bg-opacity-50 campaignbay-p-4 campaignbay-transition-opacity campaignbay-duration-300 ${
        isOpen
          ? "campaignbay-opacity-100"
          : "campaignbay-opacity-0 campaignbay-pointer-events-none"
      }`}
      onClick={handleOverlayClick}
    >
      <div
        className={`campaignbay-relative campaignbay-py-[24px] campaignbay-px-[32px] campaignbay-w-full campaignbay-rounded-lg campaignbay-bg-white campaignbay-shadow-xl campaignbay-transform campaignbay-transition-all campaignbay-duration-300 ${getSizeClasses()} ${className} ${
          isOpen ? "campaignbay-scale-100" : "campaignbay-scale-95"
        }`}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between  campaignbay-p-4">
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
        <div className={`campaignbay-p-8 ${contentClassName}`}>{children}</div>
        {footer && (
          <div className="campaignbay-border-t campaignbay-border-gray-200 campaignbay-p-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
