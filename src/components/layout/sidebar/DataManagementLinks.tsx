import React from "react";
import { Users, Calendar, PanelsTopLeft, Clock } from "lucide-react";
import SidebarNavLink from "./SidebarNavLink";
import SidebarSection from "./SidebarSection";

interface DataManagementLinksProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const DataManagementLinks: React.FC<DataManagementLinksProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  return (
    <SidebarSection title="จัดการข้อมูล">
      <SidebarNavLink
        to="/patients"
        icon={Users}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        ผู้ป่วย
      </SidebarNavLink>

      <SidebarNavLink
        to="/appointments"
        icon={Calendar}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        นัดหมาย
      </SidebarNavLink>

      <SidebarNavLink
        to="/medications"
        icon={PanelsTopLeft}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        คลังยา
      </SidebarNavLink>
      <SidebarNavLink
        to="/queue-history"
        icon={Clock}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        ประวัติคิวรับยา
      </SidebarNavLink>
      <SidebarNavLink
        to="/ins-queue-history"
        icon={Clock}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        ประวัติคิวตรวจ
      </SidebarNavLink>
    </SidebarSection>
  );
};

export default DataManagementLinks;
