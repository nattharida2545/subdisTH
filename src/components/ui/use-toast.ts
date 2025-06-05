
"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"

// Define the toast interface
interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
  action?: React.ReactNode;
}

// Re-export the components from radix-ui
export const useToast = () => {
  return {
    toast: (props: ToastProps) => {
      console.log('Toast called with props:', props);
    }
  };
};

export const toast = {
  // Direct call function
  __call: (props: ToastProps) => {
    console.log('Toast called directly:', props);
  },
  
  // Methods for different toast types
  error: (message: string, options?: any) => {
    console.log('Toast error:', message, options);
  },
  success: (message: string, options?: any) => {
    console.log('Toast success:', message, options);
  },
  info: (message: string, options?: any) => {
    console.log('Toast info:', message, options);
  },
  warning: (message: string, options?: any) => {
    console.log('Toast warning:', message, options);
  }
} as unknown as ((props: ToastProps) => void) & {
  error: (message: string, options?: any) => void;
  success: (message: string, options?: any) => void;
  info: (message: string, options?: any) => void;
  warning: (message: string, options?: any) => void;
};
