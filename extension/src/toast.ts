import { Toast } from "@base-ui/react";

export type ToastSeverity = "success" | "info" | "warn" | "error";

export interface ToastOptions {
  message: string;
  severity: ToastSeverity;
}

export const toastManager = Toast.createToastManager<ToastOptions>();

const add = (severity: ToastSeverity, message: string) =>
  toastManager.add({ title: "PureStream", timeout: 3000, data: { severity, message } });

export const toast = {
  success: (message: string) => add("success", message),
  info: (message: string) => add("info", message),
  warn: (message: string) => add("warn", message),
  error: (message: string) => add("error", message),
  update: (id: string, severity: ToastSeverity, message: string) =>
    toastManager.update(id, { data: { severity, message } }),
};
