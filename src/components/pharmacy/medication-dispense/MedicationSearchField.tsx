
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Medication } from '@/integrations/supabase/schema';

interface MedicationSearchFieldProps {
  medications: Medication[];
  selectedMedication: Medication | null;
  onSelectMedication: (medication: Medication) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MedicationSearchField: React.FC<MedicationSearchFieldProps> = ({
  medications = [],
  selectedMedication,
  onSelectMedication,
  open,
  setOpen
}) => {
  const [searchValue, setSearchValue] = useState('');
  const safeMedications = Array.isArray(medications) ? medications : [];

  console.log('[MedicationSearchField] Component rendered:', {
    medicationsCount: safeMedications.length,
    selectedMedication: selectedMedication?.name,
    isOpen: open,
    searchValue
  });

  // Filter medications based on search
  const filteredMedications = useMemo(() => {
    if (!searchValue.trim()) {
      return safeMedications;
    }
    
    const search = searchValue.toLowerCase();
    return safeMedications.filter(med => 
      med.name.toLowerCase().includes(search) || 
      med.code.toLowerCase().includes(search)
    );
  }, [safeMedications, searchValue]);

  const handleMedicationSelect = (medication: Medication) => {
    console.log('[MedicationSearchField] Medication selected:', medication);
    onSelectMedication(medication);
    setOpen(false);
    setSearchValue(''); // Clear search when item is selected
  };

  const handleOpenChange = (newOpen: boolean) => {
    console.log('[MedicationSearchField] Open state changing:', { from: open, to: newOpen });
    setOpen(newOpen);
    if (!newOpen) {
      setSearchValue(''); // Clear search when closing
    }
  };

  const handleSearchChange = (value: string) => {
    console.log('[MedicationSearchField] Search value changed:', value);
    setSearchValue(value);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">ยา</label>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            onClick={() => {
              console.log('[MedicationSearchField] Trigger button clicked');
              setOpen(!open);
            }}
          >
            {selectedMedication?.name || "เลือกยา..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 bg-white border shadow-lg z-50" align="start">
          {safeMedications.length > 0 ? (
            <div className="flex flex-col">
              {/* Search Input */}
              <div className="flex items-center border-b px-3 py-2">
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <Input
                  placeholder="ค้นหายา..."
                  value={searchValue}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              
              {/* Medication List */}
              <div className="max-h-[300px] overflow-y-auto">
                {filteredMedications.length === 0 ? (
                  <div className="py-4 text-center text-sm text-gray-500">
                    ไม่พบยา
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredMedications.map((medication) => {
                      console.log('[MedicationSearchField] Rendering medication item:', {
                        id: medication.id,
                        name: medication.name,
                        code: medication.code
                      });
                      
                      return (
                        <div
                          key={medication.id}
                          className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100"
                          onClick={() => {
                            console.log('[MedicationSearchField] Item clicked:', medication);
                            handleMedicationSelect(medication);
                          }}
                          onMouseEnter={() => {
                            console.log('[MedicationSearchField] Mouse entered item:', medication.name);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedMedication?.id === medication.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{medication.name}</span>
                            <span className="text-xs text-gray-500">
                              {medication.code} | คงเหลือ: {medication.stock} {medication.unit}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              ไม่มีข้อมูลยา
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MedicationSearchField;
