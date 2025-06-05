
import * as React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { MedicationFormValues } from "../schemas/medicationSchema";
import { cn } from "@/lib/utils";

type Props = {
  control: Control<MedicationFormValues>;
  unitOptions: string[];
  onAddNewUnit: (unit: string) => void;
};

const UnitField: React.FC<Props> = ({
  control,
  unitOptions,
  onAddNewUnit,
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  
  const filteredUnits = React.useMemo(() => {
    if (!searchValue) return unitOptions;
    return unitOptions.filter(unit => 
      unit.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [unitOptions, searchValue]);

  return (
    <FormField
      control={control}
      name="unit"
      render={({ field }) => {
        // Sync searchValue with field value when the field value changes
        React.useEffect(() => {
          if (field.value) {
            setSearchValue(field.value);
          }
        }, [field.value]);

        return (
          <FormItem className="flex flex-col relative">
            <FormLabel>หน่วย</FormLabel>
            <FormControl>
              <Input
                placeholder="พิมพ์หรือเลือกหน่วยยา..."
                value={searchValue}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchValue(value);
                  field.onChange(value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full"
              />
            </FormControl>
            {showSuggestions && (
              <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredUnits.length > 0 ? (
                  <ul className="py-1">
                    {filteredUnits.map((unit) => (
                      <li
                        key={unit}
                        className={cn(
                          "px-3 py-2 cursor-pointer hover:bg-gray-100",
                          field.value === unit && "bg-gray-100"
                        )}
                        onClick={() => {
                          field.onChange(unit);
                          setSearchValue(unit);
                          setShowSuggestions(false);
                        }}
                      >
                        {unit}
                      </li>
                    ))}
                  </ul>
                ) : searchValue ? (
                  <div 
                    className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      onAddNewUnit(searchValue);
                      field.onChange(searchValue);
                      setShowSuggestions(false);
                    }}
                  >
                    เพิ่มหน่วย "{searchValue}"
                  </div>
                ) : (
                  <div className="px-3 py-2 text-gray-500">ไม่พบหน่วยยา</div>
                )}
              </div>
            )}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default UnitField;
