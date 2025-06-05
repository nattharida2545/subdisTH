
import React from 'react';
import { BarChart3, Monitor, Settings, Clock, Ticket, TestTube } from 'lucide-react';
import SidebarNavLink from './SidebarNavLink';
import SidebarSection from './SidebarSection';

interface QueueManagementLinksProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const QueueManagementLinks: React.FC<QueueManagementLinksProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  return (
    <SidebarSection title="การจัดการคิว">
      <SidebarNavLink to="/queue" icon={Settings} isActive={isActiveRoute} onClick={closeSidebar}>
        จัดการคิว
      </SidebarNavLink>
      <SidebarNavLink to="/queue-board" icon={Monitor} isActive={isActiveRoute} onClick={closeSidebar}>
        จอแสดงคิว
      </SidebarNavLink>
      <SidebarNavLink to="/queue/create" icon={Ticket} isActive={isActiveRoute} onClick={closeSidebar}>
        สร้างคิว
      </SidebarNavLink>
      <SidebarNavLink to="/pharmacy" icon={BarChart3} isActive={isActiveRoute} onClick={closeSidebar}>
        บริการจ่ายยา
      </SidebarNavLink>
      <SidebarNavLink to="/queue-history" icon={Clock} isActive={isActiveRoute} onClick={closeSidebar}>
        ประวัติคิว
      </SidebarNavLink>
      {/* Only show test dashboard in development or for admin users */}
      {(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && (
        <SidebarNavLink to="/test-dashboard" icon={TestTube} isActive={isActiveRoute} onClick={closeSidebar}>
          ทดสอบระบบ
        </SidebarNavLink>
      )}
    </SidebarSection>
  );
};

export default QueueManagementLinks;
