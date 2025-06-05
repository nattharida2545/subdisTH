
import React from 'react';
import { Home } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SidebarNavLink from './SidebarNavLink';
import QueueManagementLinks from './QueueManagementLinks';
import DataManagementLinks from './DataManagementLinks';
import SystemLinks from './SystemLinks';

interface SidebarContentProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  return (
    <ScrollArea className="flex-1 px-3 py-4">
      <nav className="space-y-1">
        <SidebarNavLink
          to="/"
          icon={Home}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          หน้าหลัก
        </SidebarNavLink>
        
        <QueueManagementLinks 
          isActiveRoute={isActiveRoute} 
          closeSidebar={closeSidebar} 
        />
        
        <DataManagementLinks 
          isActiveRoute={isActiveRoute} 
          closeSidebar={closeSidebar} 
        />
        
        <SystemLinks 
          isActiveRoute={isActiveRoute} 
          closeSidebar={closeSidebar} 
        />
      </nav>
    </ScrollArea>
  );
};

export default SidebarContent;
