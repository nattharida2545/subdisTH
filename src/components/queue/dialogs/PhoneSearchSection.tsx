import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { createLogger } from "@/utils/logger";
import { SearchType } from "./hooks/patient/types";
import SearchTypeToggle from "./SearchTypeToggle";

const logger = createLogger("PhoneSearch");

interface PhoneSearchSectionProps {
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  idCardNumber?: string;
  setIdCardNumber?: (value: string) => void;
  searchType?: SearchType;
  setSearchType?: (value: SearchType) => void;
  handleSearch: () => void;
  isSearching: boolean;
}

const PhoneSearchSection: React.FC<PhoneSearchSectionProps> = ({
  phoneNumber,
  setPhoneNumber,
  idCardNumber = "",
  setIdCardNumber = () => {},
  searchType = "phone",
  setSearchType = () => {},
  handleSearch,
  isSearching,
}) => {
  // Log only when important values change
  useEffect(() => {
    if (searchType === "phone") {
      logger.verbose(
        `Current phone number: "${phoneNumber}", isSearching: ${isSearching}`
      );
    } else {
      logger.verbose(
        `Current ID card number: "${idCardNumber}", isSearching: ${isSearching}`
      );
    }
  }, [phoneNumber, idCardNumber, searchType, isSearching]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (searchType === "phone") {
      logger.verbose(`Phone number input changed: ${value}`);
      setPhoneNumber(value);
    } else {
      logger.verbose(`ID card number input changed: ${value}`);
      const formatIdCard = (value: string) => {
        const numbers = value.replace(/\D/g, "");
        if (numbers.length <= 13) {
          return numbers.replace(
            /(\d{1})(\d{4})(\d{5})(\d{2})(\d{1})/,
            "$1-$2-$3-$4-$5"
          );
        }
        return value;
      };
      setIdCardNumber(formatIdCard(value));
    }
  };

  const handleSearchClick = () => {
    if (searchType === "phone") {
      logger.debug(`Searching for phone number: ${phoneNumber}`);
    } else {
      logger.debug(`Searching for ID card number: ${idCardNumber}`);
    }
    handleSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchType === "phone") {
        logger.debug(`Enter key pressed, searching for phone: ${phoneNumber}`);
      } else {
        logger.debug(
          `Enter key pressed, searching for ID card: ${idCardNumber}`
        );
      }
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="grid gap-2">
      <div className="flex justify-between items-center">
        <Label
          htmlFor={searchType === "phone" ? "phoneNumber" : "idCardNumber"}
        >
          {searchType === "phone" ? "เบอร์โทรศัพท์" : "เลขบัตรประชาชน"}
        </Label>
        <SearchTypeToggle
          searchType={searchType}
          setSearchType={setSearchType}
        />
      </div>
      <div className="flex gap-2">
        <Input
          id={searchType === "phone" ? "phoneNumber" : "idCardNumber"}
          value={searchType === "phone" ? phoneNumber : idCardNumber}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          placeholder={
            searchType === "phone" ? "กรอกเบอร์โทรศัพท์" : "กรอกเลขบัตรประชาชน"
          }
          disabled={isSearching}
          maxLength={searchType === "id_card" ? 17 : 10}
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
