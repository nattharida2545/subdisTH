import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SearchType } from './hooks/patient/types';
import { createLogger } from '@/utils/logger';

const logger = createLogger('SearchTypeToggle');

interface SearchTypeToggleProps {
  searchType: SearchType;
  setSearchType: (value: SearchType) => void;
}

const SearchTypeToggle: React.FC<SearchTypeToggleProps> = ({
  searchType,
  setSearchType
}) => {
  const isIdCardSearch = searchType === 'id_card';
  
  const handleToggleChange = (checked: boolean) => {
    const newSearchType: SearchType = checked ? 'id_card' : 'phone';
    logger.debug(`Toggling search type to: ${newSearchType}`);
    setSearchType(newSearchType);
  };

  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="searchType" 
        checked={isIdCardSearch}
        onCheckedChange={handleToggleChange}
      />
      <Label 
        htmlFor="searchType" 
        className="text-sm font-medium leading-none cursor-pointer"
      >
        ค้นหาด้วยเลขบัตรประชาชน
      </Label>
    </div>
  );
};

export default SearchTypeToggle;
