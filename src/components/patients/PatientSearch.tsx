import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface PatientSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const PatientSearch: React.FC<PatientSearchProps> = ({
  searchTerm,
  onSearchChange,
}) => {
  return (
    <div className="flex">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="ค้นหาด้วยชื่อ เบอร์โทร เลขบัตรประชาชนผู้ป่วย..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default PatientSearch;
