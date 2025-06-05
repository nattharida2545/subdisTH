
import React, { useEffect } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useServicePointContext } from '@/contexts/ServicePointContext';
import { ServicePoint } from '@/integrations/supabase/schema';

interface ServicePointSelectorProps {
  className?: string;
  onlyEnabled?: boolean;
}

const ServicePointSelector: React.FC<ServicePointSelectorProps> = ({ 
  className,
  onlyEnabled = true
}) => {
  const { 
    selectedServicePoint, 
    setSelectedServicePoint, 
    servicePoints, 
    loading 
  } = useServicePointContext();
  
  const [open, setOpen] = React.useState(false);
  const filteredServicePoints = onlyEnabled 
    ? servicePoints.filter(sp => sp.enabled) 
    : servicePoints;

  if (loading) {
    return (
      <Button variant="outline" className={cn("w-[200px] justify-between", className)} disabled>
        <span>กำลังโหลดจุดบริการ...</span>
      </Button>
    );
  }

  if (filteredServicePoints.length === 0) {
    return (
      <Button variant="outline" className={cn("w-[200px] justify-between", className)} disabled>
        <span>ไม่พบจุดบริการ</span>
      </Button>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-[200px] justify-between", className)}
        >
          {selectedServicePoint ? selectedServicePoint.name : "เลือกจุดบริการ"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="ค้นหาจุดบริการ..." />
          <CommandEmpty>ไม่พบจุดบริการ</CommandEmpty>
          <CommandGroup>
            {filteredServicePoints.map((servicePoint) => (
              <CommandItem
                key={servicePoint.id}
                value={servicePoint.code}
                onSelect={() => {
                  setSelectedServicePoint(servicePoint);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedServicePoint?.id === servicePoint.id 
                      ? "opacity-100" 
                      : "opacity-0"
                  )}
                />
                {servicePoint.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default ServicePointSelector;
