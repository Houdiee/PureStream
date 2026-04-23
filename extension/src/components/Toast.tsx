import { Toast } from "@base-ui/react";
import { type ToastOptions, type ToastSeverity } from "../toast";

const icons = {
  success: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  ),
  warn: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" strokeLinejoin="round" />
      <path d="M12 9v4" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  ),
  error: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6M9 9l6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

const VARIANTS: Record<ToastSeverity, string> = {
  success: "bg-green-900/80 border-green-500/50 text-green-400",
  info: "bg-blue-900/80 border-blue-500/50 text-blue-400",
  warn: "bg-orange-900/80 border-orange-500/50 text-orange-400",
  error: "bg-red-900/80 border-red-500/50 text-red-400",
};

type ToastObject = ReturnType<typeof Toast.useToastManager<ToastOptions>>["toasts"][number];

const ToastItem = ({ toast }: { toast: ToastObject }) => {
  const severity = toast.data?.severity ?? "info";
  const variantStyles = VARIANTS[severity];
  return (
    <Toast.Root
      toast={toast}
      className={`
        group relative flex w-[20rem] overflow-hidden rounded-md border backdrop-blur-md
        transition-all duration-300 ease-in-out shadow-lg
        data-[starting-style]:translate-x-4 data-[starting-style]:opacity-0
        data-[ending-style]:opacity-0 data-[ending-style]:scale-95
        ${variantStyles}
      `}
    >
      <div className="flex w-full items-center gap-3 px-4 py-3">
        <span className="size-5 shrink-0 opacity-90">
          {icons[severity]}
        </span>
        <div className="flex flex-1 flex-col gap-0.5">
          <Toast.Title className="text-sm font-semibold leading-none">
            {toast.title}
          </Toast.Title>
          {toast.data?.message && (
            <Toast.Description className="text-xs font-medium text-white/70">
              {toast.data.message}
            </Toast.Description>
          )}
        </div>
        {toast.actionProps && (
          <Toast.Action className="shrink-0 rounded border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/90 leading-none transition-colors hover:bg-white/15" />
        )}
        <Toast.Close
          aria-label="Dismiss"
          className="flex size-5 shrink-0 items-center justify-center rounded-full opacity-50 hover:opacity-100 transition-opacity"
        >
          <span className="size-3.5">{icons.close}</span>
        </Toast.Close>
      </div>
      <div
        className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-100 ease-linear"
      />
    </Toast.Root>
  );
};

export const ToastViewport = () => {
  const { toasts } = Toast.useToastManager<ToastOptions>();

  return (
    <Toast.Viewport className="z-[2147483647] fixed top-4 right-4 z-[100] flex flex-col gap-3 outline-none">
      {toasts.map((t) => <ToastItem key={t.id} toast={t} />)}
    </Toast.Viewport>
  );
};
