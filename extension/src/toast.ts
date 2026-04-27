import { Toast } from "@base-ui/react";

export type ToastSeverity = "success" | "info" | "warn" | "error";
export type ToastAction = { children: string; onClick: () => void };

export interface ToastOptions {
  message: string;
  severity: ToastSeverity;
}

export const toastManager = Toast.createToastManager<ToastOptions>();

const NO_TIMEOUT = 2147483647;

const add = (severity: ToastSeverity, message: string, action?: ToastAction, duration: number | null = 3000) =>
  toastManager.add({
    title: "PureStream",
    timeout: duration ?? NO_TIMEOUT,
    data: { severity, message },
    ...(action && { actionProps: action }),
  });

type AddArgs = [message: string, action?: ToastAction, duration?: number | null];

export const toast = {
  success: (...args: AddArgs) => add("success", ...args),
  info: (...args: AddArgs) => add("info", ...args),
  warn: (...args: AddArgs) => add("warn", ...args),
  error: (...args: AddArgs) => add("error", ...args),
  update: (id: string, severity: ToastSeverity, message: string) => toastManager.update(id, { data: { severity, message } }),
};
