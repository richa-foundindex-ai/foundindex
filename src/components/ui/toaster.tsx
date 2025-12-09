import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts } = useToast();

  console.log("[Toaster] Rendering toasts:", toasts.map(t => ({ id: t.id, variant: t.variant, open: t.open, duration: t.duration })));

  return (
    <ToastProvider swipeDirection="right" duration={Number.POSITIVE_INFINITY}>
      {toasts.map(function ({ id, title, description, action, duration, variant, open, onOpenChange, ...props }) {
        // Force destructive toasts to never auto-dismiss
        const effectiveDuration = variant === "destructive" ? Number.POSITIVE_INFINITY : (duration ?? 5000);
        
        console.log(`[Toast ${id}] variant=${variant}, effectiveDuration=${effectiveDuration}, open=${open}`);
        
        return (
          <Toast 
            key={id} 
            duration={effectiveDuration} 
            variant={variant} 
            open={open}
            onOpenChange={(isOpen) => {
              console.log(`[Toast ${id}] onOpenChange called with: ${isOpen}`);
              onOpenChange?.(isOpen);
            }}
            {...props}
          >
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
