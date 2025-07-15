import { useContext } from '@wordpress/element';
import { ToastContext } from './toast-context';

/**
 * A custom hook that provides easy access to the toast context.
 *
 * @returns {{
 *   toasts: Array<Object>,
 *   addToast: (message: string, type: string) => void,
 *   removeToast: (id: number) => void
 * }}
 */
export const useToast = () => {
    const context = useContext(ToastContext);

    if (context === null) {
        throw new Error('useToast must be used within a ToastProvider');
    }

    return context;
};
