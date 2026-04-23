import { Toast } from "@base-ui/react";

export type ToastSeverity = "success" | "info" | "warn" | "error";

export interface ToastOptions {
  message: string;
  severity: ToastSeverity;
}

export const toastManager = Toast.createToastManager<ToastOptions>();

const add = (severity: ToastSeverity, message: string, actionProps?: { children: string; onClick: () => void }, duration = 3000) =>
  toastManager.add({
    title: "PureStream",
    timeout: duration,
    data: { severity, message },
    ...(actionProps && { actionProps }),
  });

export const toast = {
  success: (message: string, actionProps?: { children: string; onClick: () => void }, duration?: number) =>
    add("success", message, actionProps, duration),
  info: (message: string, actionProps?: { children: string; onClick: () => void }, duration?: number) =>
    add("info", message, actionProps, duration),
  warn: (message: string, actionProps?: { children: string; onClick: () => void }, duration?: number) =>
    add("warn", message, actionProps, duration),
  error: (message: string, actionProps?: { children: string; onClick: () => void }, duration?: number) =>
    add("error", message, actionProps, duration),
  update: (id: string, severity: ToastSeverity, message: string) => toastManager.update(id, { data: { severity, message } }),
};
