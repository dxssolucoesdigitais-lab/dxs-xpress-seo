import { toast } from "sonner";
import i18n from "@/lib/i18n";

type ToastOptions = {
  [key: string]: any;
  message?: string; // Adiciona 'message' às opções
};

export const showSuccess = (key: string, options?: ToastOptions) => {
  toast.success(i18n.t(key, options));
};

export const showError = (key: string, options?: ToastOptions) => {
  // Se uma mensagem for fornecida nas opções, usa-a diretamente ou a anexa à chave traduzida
  const translatedMessage = options?.message ? `${i18n.t(key, options)}: ${options.message}` : i18n.t(key, options);
  toast.error(translatedMessage);
};

export const showLoading = (key: string, options?: ToastOptions) => {
  return toast.loading(i18n.t(key, options));
};

export const dismissToast = (toastId: string | number) => {
  toast.dismiss(toastId);
};