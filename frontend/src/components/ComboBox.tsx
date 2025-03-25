import React, { useState, useRef, useEffect } from 'react';
import '../styles/ComboBox.css';

interface Option {
  id: number;
  label: string;
}

interface ComboBoxProps {
  options: Option[];
  value: string;
  onChange: (value: string, id: number) => void;
  placeholder: string;
  disabled?: boolean;
}

const ComboBox: React.FC<ComboBoxProps> = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const filtered = options.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOptions(filtered);
  }, [inputValue, options]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };

  const handleOptionClick = (option: Option) => {
    setInputValue(option.label);
    onChange(option.label, option.id);
    setIsOpen(false);
  };

  return (
    <div className="combobox-wrapper" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        disabled={disabled}
        className="combobox-input"
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="combobox-options">
          {filteredOptions.map(option => (
            <li
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="combobox-option"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ComboBox; 