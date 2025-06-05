
import { useToast as useToastUI } from "@/components/ui/use-toast";
import { toast as toastBase } from "@/components/ui/use-toast";
import { toast as sonnerToast } from "sonner";

// Re-export with clear names to prevent conflicts
export const useToast = useToastUI;
export const toast = sonnerToast;
