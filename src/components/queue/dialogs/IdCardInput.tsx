import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createLogger } from '@/utils/logger';

const logger = createLogger('IdCardInput');

interface IdCardInputProps {
  idCardNumber: string;
  setIdCardNumber: (value: string) => void;
  onEnterPress?: () => void;
  disabled?: boolean;
  showIdCardInput?: boolean;
}

const IdCardInput: React.FC<IdCardInputProps> = ({
  idCardNumber,
  setIdCardNumber,
  onEnterPress,
  disabled = false,
  showIdCardInput = true
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    logger.verbose(`ID card number input changed: ${value}`);
    setIdCardNumber(value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterPress) {
      logger.debug(`Enter key pressed with ID card: ${idCardNumber}`);
      e.preventDefault();
      onEnterPress();
    }
  };

  if (!showIdCardInput) {
    return null;
  }
  
  return (
    <div className="grid gap-2">
      <Label htmlFor="idCardNumber">เลขบัตรประชาชน</Label>
      <Input
        id="idCardNumber"
        value={idCardNumber}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        placeholder="กรอกเลขบัตรประชาชน"
        disabled={disabled}
      />
      <div id="idCardInput" data-show={showIdCardInput.toString()}></div>
    </div>
  );
};

export default IdCardInput;
