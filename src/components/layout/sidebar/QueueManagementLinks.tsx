import React from "react";
import { BarChart3, Monitor, Settings, Ticket, TestTube } from "lucide-react";
import SidebarNavLink from "./SidebarNavLink";
import SidebarSection from "./SidebarSection";

interface QueueManagementLinksProps {
  isActiveRoute: (path: string) => boolean;
  closeSidebar: () => void;
}

const QueueManagementLinks: React.FC<QueueManagementLinksProps> = ({
  isActiveRoute,
  closeSidebar,
}) => {
  return (
    <SidebarSection title="การจัดการคิวตรวจ">
      <SidebarNavLink
        to="/queue/create-ins"
        icon={Ticket}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        สร้างคิวตรวจ
      </SidebarNavLink>
      <SidebarNavLink
        to="/ins-queue"
        icon={BarChart3}
        isActive={isActiveRoute}
        onClick={closeSidebar}
      >
        บริการตรวจ
      </SidebarNavLink>
      <SidebarSection title="การจัดการคิวรับยา">
        <SidebarNavLink
          to="/queue"
          icon={Settings}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          จัดการคิวรับยา
        </SidebarNavLink>
        <SidebarNavLink
          to="/queue/create"
          icon={Ticket}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          สร้างคิวรับยา
        </SidebarNavLink>
        <SidebarNavLink
          to="/pharmacy"
          icon={BarChart3}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          บริการจ่ายยา
        </SidebarNavLink>
      </SidebarSection>
      <SidebarSection title="จอแสดงคิว">
        <SidebarNavLink
          to="/queue-board"
          icon={Monitor}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          จอแสดงคิวรับยา
        </SidebarNavLink>
        <SidebarNavLink
          to="/queue-board-ins"
          icon={Monitor}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          จอแสดงคิวตรวจ
        </SidebarNavLink>
        <SidebarNavLink
          to="/combined-queue-board"
          icon={Monitor}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          จอแสดงคิวรวม
        </SidebarNavLink>
      </SidebarSection>

      {/* Only show test dashboard in development or for admin users */}
      {(process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost") && (
        <SidebarNavLink
          to="/test-dashboard"
          icon={TestTube}
          isActive={isActiveRoute}
          onClick={closeSidebar}
        >
          ทดสอบระบบ
        </SidebarNavLink>
      )}
    </SidebarSection>
  );
};

export default QueueManagementLinks;
