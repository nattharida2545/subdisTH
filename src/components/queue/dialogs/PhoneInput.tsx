import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLogger } from '@/utils/logger';

const logger = createLogger('PhoneInput');

interface PhoneInputProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
  showPhoneInput?: boolean;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  phoneNumber,
  setPhoneNumber,
  onEnterPress,
  disabled = false,
  showPhoneInput = true
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logger.verbose(`Phone number input changed: ${value}`);
    setPhoneNumber(value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      logger.debug(`Enter key pressed with phone: ${phoneNumber}`);
      e.preventDefault();
      onEnterPress();
    }
  };

  if (!showPhoneInput) {
    return null;
  }
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
      <Input
        id="phoneNumber"
        value={phoneNumber}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="กรอกเบอร์โทรศัพท์"
        disabled={disabled}
      />
      <div id="phoneInput" data-show={showPhoneInput.toString()}></div>
    </div>
  );
};

export default PhoneInput;
