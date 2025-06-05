
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Patient } from '@/integrations/supabase/schema';
import { usePatients } from '@/hooks/usePatients';

interface PatientSearchSectionProps {
  onPatientSelect: (patient: Patient) => void;
  selectedPatientId?: string;
}

export const PatientSearchSection = ({
  onPatientSelect,
  selectedPatientId
}: PatientSearchSectionProps) => {
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<Patient[]>([]);
  const { findPatientByPhone, searchPatients } = usePatients();

  const handleSearch = async () => {
    if (phoneNumber) {
      const results = await searchPatients(phoneNumber);
      setSearchResults(results);
    }
  };

  React.useEffect(() => {
    // Clear results when selected patient changes
    if (selectedPatientId) {
      setSearchResults([]);
      setPhoneNumber('');
    }
  }, [selectedPatientId]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="phone-search">ค้นหาผู้ป่วยด้วยเบอร์โทรศัพท์</Label>
          <Input
            id="phone-search"
            type="tel"
            placeholder="กรอกเบอร์โทรศัพท์"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSearch}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {searchResults.length > 0 && (
        <div className="border rounded-md p-2 space-y-2">
          {searchResults.map((patient) => (
            <div
              key={patient.id}
              className={`p-2 rounded hover:bg-gray-100 cursor-pointer ${
                selectedPatientId === patient.id ? 'bg-gray-100' : ''
              }`}
              onClick={() => onPatientSelect(patient)}
            >
              <div className="font-medium">{patient.name}</div>
              <div className="text-sm text-gray-500">{patient.phone}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
