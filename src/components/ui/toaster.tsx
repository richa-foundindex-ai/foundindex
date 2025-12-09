import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right" duration={Infinity}>
      {toasts.map(function ({ id, title, description, action, duration, variant, ...props }) {
        // Force destructive toasts to never auto-dismiss
        const effectiveDuration = variant === "destructive" ? Infinity : (duration ?? 5000);
        
        return (
          <Toast key={id} duration={effectiveDuration} variant={variant} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
