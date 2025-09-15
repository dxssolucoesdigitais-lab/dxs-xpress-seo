import { toast } from "sonner";
import i18n from "@/lib/i18n";

type ToastOptions = {
  [key: string]: any;
};

export const showSuccess = (key: string, options?: ToastOptions) => {
  toast.success(i18n.t(key, options));
};

export const showError = (key: string, options?: ToastOptions) => {
  toast.error(i18n.t(key, options));
};

export const showLoading = (key: string, options?: ToastOptions) => {
  return toast.loading(i18n.t(key, options));
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};