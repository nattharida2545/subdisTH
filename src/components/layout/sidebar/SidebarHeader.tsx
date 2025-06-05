
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarHeaderProps {
  closeSidebar: () => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ closeSidebar }) => {
  return (
    <div className="h-16 flex items-center px-6 border-b border-gray-200">
      <h1 className="text-xl font-semibold tracking-tight">SubdisTH-Que</h1>
      <Button
        variant="ghost"
        size="icon"
        onClick={closeSidebar}
        className="ml-auto lg:hidden"
      >
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default SidebarHeader;
