
import React from 'react';

const SidebarFooter: React.FC = () => {
  return (
    <div className="p-4 border-t border-gray-200 text-xs text-gray-500 text-center flex-shrink-0">
      &copy; {new Date().getFullYear()} SubdisTH-Que
    </div>
  );
};

export default SidebarFooter;
