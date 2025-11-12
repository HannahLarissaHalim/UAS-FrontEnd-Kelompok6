'use client';
import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ value, onChange, options, placeholder = "Select..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="custom-select-container" ref={dropdownRef}>
      <div 
        className="custom-select-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={!value ? 'placeholder-text' : ''}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          width="12" 
          height="8" 
          viewBox="0 0 12 8" 
          className={`dropdown-arrow ${isOpen ? 'open' : ''}`}
        >
          <path fill="#0A4988" d="M1 1l5 5 5-5"/>
        </svg>
      </div>

      {isOpen && (
        <div className="custom-select-dropdown">
          {options.map((option, index) => (
            <div
              key={option.value}
              className={`custom-select-option ${value === option.value ? 'selected' : ''} ${index === 0 ? 'first' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
