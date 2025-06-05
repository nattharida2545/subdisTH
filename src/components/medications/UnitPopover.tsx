
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UnitPopoverProps {
  unitOptions: { value: string, label: string }[];
  value: string;
  open: boolean;
  newUnitInput: string;
  setOpen: (open: boolean) => void;
  setValue: (newValue: string) => void;
  setNewUnitInput: (input: string) => void;
  handleAddNewUnit: () => void;
}

const UnitPopover: React.FC<UnitPopoverProps> = ({
  unitOptions,
  value,
  open,
  newUnitInput,
  setOpen,
  setValue,
  setNewUnitInput,
  handleAddNewUnit
}) => {
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between',
            !value && 'text-muted-foreground'
          )}
          type="button"
        >
          {value || 'เลือกหน่วย...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="ค้นหาหรือเพิ่มหน่วยใหม่..."
            value={newUnitInput}
            onValueChange={setNewUnitInput}
            autoFocus={true}
          />
          <CommandEmpty>
            {newUnitInput ? (
              <Button
                type="button"
                variant="ghost"
                className="flex items-center justify-start w-full px-2 py-1.5"
                onClick={handleAddNewUnit}
              >
                <Plus className="mr-2 h-4 w-4" />
                {`เพิ่ม "${newUnitInput}"`}
              </Button>
            ) : (
              "ไม่พบหน่วยที่ค้นหา"
            )}
          </CommandEmpty>
          <CommandGroup className="max-h-52 overflow-y-auto">
            {unitOptions.map((unit) => (
              <CommandItem
                key={unit.value}
                value={unit.value}
                onSelect={() => {
                  setValue(unit.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn("mr-2 h-4 w-4", value === unit.value ? "opacity-100" : "opacity-0")}
                />
                {unit.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default UnitPopover;
