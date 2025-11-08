import React, { useState } from "react";
import { Search, X, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { th } from "date-fns/locale";

interface AppointmentSearchFormProps {
  nameSearchTerm: string;
  setNameSearchTerm: (value: string) => void;
  phoneSearchTerm: string;
  setPhoneSearchTerm: (value: string) => void;
  idcardSearchTerm: string;
  setIDcardSearchTerm: (value: string) => void;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  setDateRange: (range: {
    from: Date | undefined;
    to: Date | undefined;
  }) => void;
  onClearSearch: () => void;
  isFiltered: boolean;
}

const AppointmentSearchForm: React.FC<AppointmentSearchFormProps> = ({
  nameSearchTerm,
  setNameSearchTerm,
  phoneSearchTerm,
  setPhoneSearchTerm,
  idcardSearchTerm,
  setIDcardSearchTerm,
  dateRange,
  setDateRange,
  onClearSearch,
  isFiltered,
}) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  let dateRangeText = "เลือกช่วงวันที่";
  if (dateRange.from) {
    dateRangeText = dateRange.to
      ? `${format(dateRange.from, "d MMM", { locale: th })} - ${format(
          dateRange.to,
          "d MMM",
          { locale: th }
        )}`
      : format(dateRange.from, "d MMM", { locale: th });
  }

  return (
    <div className="mb-4 space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {/* Patient Name Search */}
        <div className="relative col-span-2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาด้วยชื่อ เบอร์โทร เลขบัตรประชาชนผู้ป่วย..."
            className="pl-10"
            value={nameSearchTerm}
            onChange={(e) => setNameSearchTerm(e.target.value)}
          />
        </div>

        {/* Phone Number Search */}
        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาตามเบอร์โทรศัพท์..."
            className="pl-10"
            value={phoneSearchTerm}
            onChange={(e) => setPhoneSearchTerm(e.target.value)}
          />
        </div> */}

        {/* <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="ค้นหาตามเลขบัตรประชาชน..."
            className="pl-10"
            value={idcardSearchTerm}
            onChange={(e) => setIDcardSearchTerm(e.target.value)}
          />
        </div> */}

        {/* Date Range Picker */}
        <div className="flex gap-2">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRangeText}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="range"
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({ from: range?.from, to: range?.to });
                  if (range?.to) setCalendarOpen(false);
                }}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {isFiltered && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClearSearch}
              className="flex-shrink-0"
              title="ล้างการค้นหา"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentSearchForm;
