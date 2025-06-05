
import React, { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PhoneSearch');

interface PhoneSearchSectionProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  handlePhoneSearch: () => void;
  isSearching: boolean;
}

const PhoneSearchSection: React.FC<PhoneSearchSectionProps> = ({
  phoneNumber,
  setPhoneNumber,
  handlePhoneSearch,
  isSearching
}) => {
  // Log only when important values change
  useEffect(() => {
    logger.verbose(`Current phone number: "${phoneNumber}", isSearching: ${isSearching}`);
  }, [phoneNumber, isSearching]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    logger.verbose(`Phone number input changed: ${e.target.value}`);
    setPhoneNumber(e.target.value);
  };
  
  const handleSearchClick = () => {
    logger.debug(`Searching for phone number: ${phoneNumber}`);
    handlePhoneSearch();
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      logger.debug(`Enter key pressed, searching for: ${phoneNumber}`);
      e.preventDefault();
      handlePhoneSearch();
    }
  };

  return (
    <div className="grid gap-2">
      <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
      <div className="flex gap-2">
        <Input
          id="phoneNumber"
          value={phoneNumber}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder="กรอกเบอร์โทรศัพท์"
          disabled={isSearching}
        />
        <Button 
          variant="outline" 
          onClick={handleSearchClick}
          disabled={isSearching}
          className="px-3"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PhoneSearchSection;
