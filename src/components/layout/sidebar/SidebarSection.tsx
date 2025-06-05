
import React from 'react';

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  return (
    <>
      <div className="pt-4 pb-2">
        <div className="px-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {title}
          </h3>
        </div>
      </div>
      {children}
    </>
  );
};

export default SidebarSection;
