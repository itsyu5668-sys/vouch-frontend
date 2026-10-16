import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  value,
  onChange,
  options,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  placeholder = 'Select option...',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button - Arrow is snug next to text, not miles away */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center justify-between gap-2 rounded-full border border-[#bebecc] bg-white text-[#070709] font-medium transition-all hover:border-[#070709] focus:outline-none focus:ring-1 focus:ring-[#070709] ${
          size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-xs'
        } ${buttonClassName}`}
      >
        <span className="whitespace-nowrap truncate max-w-[220px]">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#60606c] shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#070709]' : ''
          }`}
        />
      </button>

      {/* Floating Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 mt-1.5 min-w-[200px] w-max max-w-xs z-50 bg-white rounded-[16px] shadow-atmospheric border border-black/[0.08] py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
        >
          <div className="max-h-60 overflow-y-auto py-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between gap-3 transition-colors ${
                    isSelected
                      ? 'bg-[#f5f5f5] text-[#070709] font-semibold'
                      : 'text-[#60606c] hover:bg-[#f5f5f5] hover:text-[#070709]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[#2597d0] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
