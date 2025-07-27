import { useState, useCallback } from '@wordpress/element';
import { ToastContext } from './toast-context';

/**
 * ToastProvider is a component that manages the state for toast notifications.
 * It provides the `toasts` array, an `addToast` function, and a `removeToast` function
 * to all child components via the ToastContext.
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    /**
     * Removes a toast from the state by its ID.
     * Wrapped in useCallback for performance optimization.
     */
    const removeToast = useCallback((id) => {
        setToasts((currentToasts) =>
            currentToasts.filter((toast) => toast.id !== id)
        );
    }, []);

    /**
     * Adds a new toast to the state.
     * Generates a unique ID for each toast.
     * Wrapped in useCallback for performance optimization.
     *
     * @param {string} message The message to display.
     * @param {string} type    The type of toast (e.g., 'success', 'error', 'info'). Defaults to 'info'.
     */
    const addToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random(); // Simple unique ID generator
        const newToast = { id, message, type };
        setToasts((currentToasts) => [...currentToasts, newToast]);
    }, []);

    // The value object provided to all consumer components of this context.
    const value = {
        toasts,
        addToast,
        removeToast,
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
        </ToastContext.Provider>
    );
};