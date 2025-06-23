
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import SidebarHeader from './sidebar/SidebarHeader';
import SidebarContent from './sidebar/SidebarContent';
import SidebarFooter from './sidebar/SidebarFooter';

export function Sidebar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white border-gray-200"
        >
          {isSidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "w-64 bg-white border-r border-gray-200 transition-all duration-200 ease-in-out",
          // Desktop: always visible, relative positioning with full height
          "lg:relative lg:translate-x-0 lg:h-screen",
          // Mobile: fixed positioning with conditional visibility and full height
          "fixed top-0 left-0 z-50 h-screen",
          isSidebarOpen 
            ? "translate-x-0" 
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Sidebar content as flex column with full height */}
        <div className="flex flex-col h-full">
          <SidebarHeader closeSidebar={closeSidebar} />
          <SidebarContent isActiveRoute={isActiveRoute} closeSidebar={closeSidebar} />
          <SidebarFooter />
        </div>
      </div>
    </>
  );
}

export default Sidebar;
