import { useToast } from '../store/toast/use-toast';
import { Toast } from './Toast';

/**
 * A container that renders all active toasts.
 * This should be placed at the top level of your app layout.
 */
export const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    toast={toast}
                    onDismiss={removeToast}
                />
            ))}
        </div>
    );
};