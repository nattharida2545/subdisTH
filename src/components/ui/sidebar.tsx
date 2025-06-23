
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/components/theme/ThemeProvider";
import { createLogger } from "@/utils/logger";

const logger = createLogger('Sidebar');

interface SidebarProps {
  className?: string;
}

interface SidebarItemProps {
  title: string;
  href: string;
  icon?: React.ReactNode;
  className?: string;
}

// Create SidebarProvider context
const SidebarContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: true,
  setIsOpen: () => {},
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <SidebarContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  // Use our custom theme hook if needed
  const { theme } = useTheme();
  
  logger.debug('Component rendering'); // Changed from info to debug
  
  return (
    <NavigationMenu className={cn("hidden lg:flex items-center", className)}>
      <NavigationMenuList>
        <SidebarItem title="Dashboard" href="/" icon={null} />
        <SidebarItem title="Queue Management" href="/queue-management" icon={null} />
        <SidebarItem title="Analytics" href="/analytics" icon={null} />
        <SidebarItem title="Queue Board" href="/queue-board" icon={null} />
        <SidebarItem title="Patients" href="/patients" icon={null} />
        <SidebarItem title="Medications" href="/medications" icon={null} />
        <SidebarItem title="Appointments" href="/appointments" icon={null} />
        <SidebarItem title="History" href="/history" icon={null} />
        <SidebarItem title="Settings" href="/settings" icon={null} />
      </NavigationMenuList>
    </NavigationMenu>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ title, href, icon, className }) => {
  const location = useLocation();
  const isActive = location.pathname === href;

  return (
    <NavigationMenuItem>
      <NavigationMenuLink
        asChild
        className={cn(
          navigationMenuTriggerStyle(),
          "data-[active]:text-foreground data-[active]:bg-muted",
          isActive ? "bg-muted text-foreground" : "text-muted-foreground",
          className
        )}
      >
        <Link to={href}>
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

export default Sidebar;
