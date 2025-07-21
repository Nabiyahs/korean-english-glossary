"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} className="top-4 right-4 bg-white border-samoo-blue/20 shadow-lg">
          <div className="grid gap-1">
            {title && <ToastTitle className="text-samoo-blue font-semibold">{title}</ToastTitle>}
            {description && <ToastDescription className="text-samoo-gray text-sm">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose className="text-samoo-gray-medium hover:text-samoo-blue" />
        </Toast>
      ))}
      <ToastViewport className="fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-auto sm:right-4 sm:top-4 sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  )
}
