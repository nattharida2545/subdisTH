
import React from 'react';
import { Settings, BarChart3 } from 'lucide-react';
import SidebarSection from './SidebarSection';
import SidebarNavLink from './SidebarNavLink';

interface SystemLinksProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const SystemLinks: React.FC<SystemLinksProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  return (
    <SidebarSection title="ระบบ">
      <SidebarNavLink
        to="/analytics"
        icon={BarChart3}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        รายงานและสถิติ
      </SidebarNavLink>
      
      <SidebarNavLink
        to="/settings"
        icon={Settings}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        การตั้งค่าระบบ
      </SidebarNavLink>
    </SidebarSection>
  );
};

export default SystemLinks;
