import { useEffect, useState } from '@wordpress/element';

/**
 * Represents a single toast notification with closing animation.
 *
 * @param {Object}   toast      The toast object ({id, message, type}).
 * @param {Function} onDismiss  The function to call to remove the toast from the global state.
 */
export const Toast = ({ toast, onDismiss }) => {
    // 1. Add a local state to track the closing animation
    const [isClosing, setIsClosing] = useState(false);

    // 2. Create a handler that starts the closing animation
    //    and then calls the real dismiss function after the animation finishes.
    const handleDismiss = () => {
        setIsClosing(true); // Trigger the closing animation

        // Wait for the animation to complete (300ms) before removing from the DOM
        setTimeout(() => {
            onDismiss(toast.id);
        }, 300);
    };

    // 3. The auto-dismiss timer now calls our new handler
    useEffect(() => {
        const timer = setTimeout(() => {
            handleDismiss();
        }, 5000); // 5-second timeout

        return () => {
            clearTimeout(timer);
        };
        // The dependency array is updated to use the stable handleDismiss function.
    }, [toast.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // 4. We add a dynamic class based on the closing state
    const toastClasses = `toast toast--${toast.type} ${isClosing ? 'toast--closing' : ''
        }`;

    return (
        <div className={toastClasses}>
            <p className="toast__message">{toast.message}</p>
            <button
                className="toast__close-button"
                onClick={handleDismiss} // The close button also calls our new handler
            >
                ×
            </button>
        </div>
    );
};