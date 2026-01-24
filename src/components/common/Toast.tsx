import React, { useEffect, useState, FC } from "react";

import { Toast as ToastType } from "../../store/toast/use-toast";
import { close, Icon } from "@wordpress/icons";

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: number) => void;
}
export const Toast: FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isClosing, setIsClosing] = useState<boolean>(false);

  const handleDismiss = () => {
    setIsClosing(true);
    setTimeout(() => {
      onDismiss(toast.id);
    }, 300); // 300ms animation
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleDismiss();
    }, 5000); // 5 seconds
    return () => {
      clearTimeout(timer);
    };
  }, [toast.id]);
  const toastClasses = `toast toast--${toast.type} ${
    isClosing ? "toast--closing" : ""
  }`;

  return (
    <div className={toastClasses}>
      <p className="campaignbay-margin-0 campaignbay-text[14px] campaignbay-leading-1.5 campaignbay-flex-1 ">
        {toast.message}
      </p>
      <button
        className="campaignbay-bg-none campaignbay-border-none campaignbay-text-inherit campaignbay-opacity-60 hover:campaignbay-opacity-100 campaignbay-cursor-pointer campaignbay-text[20px] campaignbay-leading-1 campaignbay-px[5px] campaignbay-self-start campaignbay-mt[-5px] campaignbay-mr[-5px] campaignbay-mb[-5px] campaignbay-ml-0"
        onClick={handleDismiss}
        aria-label="Dismiss"
      >
        <Icon icon={close} />
      </button>
    </div>
  );
};

export default Toast;
