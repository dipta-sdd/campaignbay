import { FC } from "react";
import { useToast } from "../../store/toast/use-toast";
import { Toast } from "./Toast";

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="campaignbay-fixed campaignbay-top-[10px] campaignbay-right-[10px] campaignbay-z-[999999] campaignbay-flex campaignbay-flex-col campaignbay-gap-[10px] campaignbay-min-w-[200px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};
