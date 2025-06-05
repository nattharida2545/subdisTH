
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// This is now a legacy component kept for compatibility
// It is recommended to use AppointmentSearchForm instead
interface AppointmentSearchProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
}

const AppointmentSearch: React.FC<AppointmentSearchProps> = ({ 
  searchTerm, 
  setSearchTerm 
}) => {
  console.warn('AppointmentSearch is deprecated. Use AppointmentSearchForm instead.');
  return (
    <div className="flex mb-4">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="ค้นหานัดหมาย..." 
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default AppointmentSearch;
