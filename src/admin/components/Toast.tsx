import React, { useEffect, useState, FC } from '@wordpress/element';

import { Toast as ToastType } from "../store/toast/use-toast";

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
    const toastClasses = `toast toast--${toast.type} ${isClosing ? 'toast--closing' : ''}`;

    return (
        <div className={toastClasses}>
            <p className="toast__message">{toast.message}</p>
            <button
                className="toast__close-button"
                onClick={handleDismiss}
                aria-label="Dismiss" 
            >
                ×
            </button>
        </div>
    );
};

export default Toast;