
import { FC } from 'react';
import { useToast } from '../store/toast/use-toast';
import { Toast } from './Toast';

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};