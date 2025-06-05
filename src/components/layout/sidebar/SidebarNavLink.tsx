
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface SidebarNavLinkProps {
  to: string;
  icon: LucideIcon;
  children: React.ReactNode;
  isActive: (path: string) => boolean;
  onClick?: () => void;
}

const SidebarNavLink: React.FC<SidebarNavLinkProps> = ({
  to,
  icon: Icon,
  children,
  isActive,
  onClick,
}) => {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive: active }) =>
        cn(
          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive(to)
            ? "bg-gray-100 text-gray-900"
            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        )
      }
    >
      <Icon className="mr-3 h-5 w-5" />
      {children}
    </NavLink>
  );
};

export default SidebarNavLink;
