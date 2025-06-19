
import * as React from 'react';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, className, fullWidth = false }) => {
  const [mounted, setMounted] = React.useState(false);
  
  // Wait for component to mount to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
    console.log("[DEBUG] Layout component mounted");
    
    // Force a re-render after a brief delay to ensure styles are applied
    const timer = setTimeout(() => {
      console.log("[DEBUG] Layout forcing style refresh");
      setMounted(state => state); // Trigger re-render
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Show a loading state until the component is mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center" style={{backgroundColor: "hsl(var(--background))"}}>
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" style={{backgroundColor: "hsl(var(--background))"}}>
      <Sidebar />
      <main
        className={cn(
          "lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all duration-300",
          className
        )}
      >
        {/* Apply full width with no padding/container when fullWidth is true */}
        {fullWidth ? (
          <div className="animate-fade-in w-full h-full">
            {/* Debug overlay in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed top-2 right-2 bg-black/70 text-white text-xs p-1 rounded z-50">
                Layout rendered (fullWidth)
              </div>
            )}
            {children}
          </div>
        ) : (
          <div className="container mx-auto p-6 animate-fade-in">
            {/* Debug overlay in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="fixed top-2 right-2 bg-black/70 text-white text-xs p-1 rounded z-50">
                Layout rendered (container)
              </div>
            )}
            {children}
          </div>
        )}
      </main>
    </div>
  );
};

export default Layout;
