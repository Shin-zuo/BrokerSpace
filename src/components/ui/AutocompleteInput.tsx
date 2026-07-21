"use client";
import React, { useState, useEffect, useRef } from "react";

interface AutocompleteInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string, code?: string) => void;
  options: { label: string; value: string; code?: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export default function AutocompleteInput({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled
}: AutocompleteInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: { label: string; value: string; code?: string }) => {
    setInputValue(option.label);
    onChange(option.label, option.code);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-1.5" ref={wrapperRef}>
      <label htmlFor={name} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          type="text"
          disabled={disabled}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            onChange(e.target.value); // Allow arbitrary text or partial text
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-slate-100 disabled:text-slate-500 text-sm text-slate-900"
        />
        {isOpen && !disabled && (
          <ul className="absolute z-50 w-full mt-1 max-h-60 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 cursor-pointer hover:bg-blue-50 text-sm text-slate-900 transition-colors"
                >
                  {option.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-slate-500">No results found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
