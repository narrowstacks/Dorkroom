import React from "react";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectItem,
  SelectScrollView,
} from "@/components/ui/select";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ChevronDownIcon } from "@/components/ui/icon"

interface StyledSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
  placeholder?: string;
}

export function StyledSelect({ 
  value, 
  onValueChange, 
  items, 
  placeholder = "Select an option" 
}: StyledSelectProps) {
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "borderColor");
  const inputBackground = useThemeColor({}, "inputBackground");
  
  const selectedItem = items.find(item => item.value === value);
  
  return (
    <Select
      selectedValue={value}
      onValueChange={onValueChange}
      className={`w-full border rounded-xl`}
      style={{
        backgroundColor: inputBackground,
        borderColor,
      }}
    >
      <SelectTrigger
        className={`h-12 flex-row items-center justify-between px-4`}
        style={{
          backgroundColor: inputBackground,
          borderColor,
        }}
      >
        <SelectInput
          placeholder={placeholder}
          value={selectedItem?.label || ""}
          editable={false}
          className={`flex-1 text-base`}
          style={{ color: textColor }}
        />
        <SelectIcon className="mr-3" as={ChevronDownIcon} color={textColor} />
      </SelectTrigger>
      <SelectPortal>
        <SelectBackdrop />
        <SelectContent className={`bg-background rounded-t-xl`}>
          <SelectScrollView>
            {items.map((item) => (
              <SelectItem
                key={item.value}
                label={item.label}
                value={item.value}
                className={`py-4 px-6 border-b border-outline-200`}
              />
            ))}
          </SelectScrollView>
        </SelectContent>
      </SelectPortal>
    </Select>
  );
}