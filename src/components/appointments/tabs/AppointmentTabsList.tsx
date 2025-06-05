
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AppointmentTabsListProps {
  todayCount: number;
  tomorrowCount: number;
  upcomingCount: number;
  isFiltered: boolean;
  filteredCount: number;
}

const AppointmentTabsList: React.FC<AppointmentTabsListProps> = ({
  todayCount,
  tomorrowCount,
  upcomingCount,
  isFiltered,
  filteredCount,
}) => {
  return (
    <TabsList>
      <TabsTrigger value="today" disabled={isFiltered}>
        วันนี้ ({todayCount})
      </TabsTrigger>
      <TabsTrigger value="tomorrow" disabled={isFiltered}>
        พรุ่งนี้ ({tomorrowCount})
      </TabsTrigger>
      <TabsTrigger value="upcoming" disabled={isFiltered}>
        นัดหมายในอนาคต ({upcomingCount})
      </TabsTrigger>
      {isFiltered && (
        <TabsTrigger value="search-results">
          ผลการค้นหา ({filteredCount})
        </TabsTrigger>
      )}
    </TabsList>
  );
};

export default AppointmentTabsList;
