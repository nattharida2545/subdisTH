
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

export type Theme = 'dark' | 'light' | 'system';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

// A custom hook that provides access to the theme context
export const useTheme = () => {
  // Always define state hooks first
  const [mounted, setMounted] = React.useState(false);
  const [theme, setThemeState] = React.useState<Theme>("light");
  
  // Function to set the theme - Define useCallback before useEffect
  const setTheme = React.useCallback((newTheme: Theme) => {
    localStorage.setItem("vite-ui-theme", newTheme);
    setThemeState(newTheme);
    
    // Update the class on the document element
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event("storage"));
  }, []);
  
  // Register effects after all other hook definitions
  React.useEffect(() => {
    // Set mounted state once the component using this hook mounts
    setMounted(true);
    
    // Function to handle theme changes from localStorage
    const handleStorageChange = () => {
      const storedTheme = localStorage.getItem("vite-ui-theme");
      if (storedTheme) {
        setThemeState(storedTheme as Theme);
      }
    };
    
    // Initialize theme from localStorage
    handleStorageChange();
    
    // Listen for storage changes
    window.addEventListener("storage", handleStorageChange);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
  
  return {
    theme: mounted ? theme : "light",
    setTheme
  };
};
