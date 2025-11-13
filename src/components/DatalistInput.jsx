import { useState, useContext } from 'react';
import { AppContext } from '../contexts/AppContext';

export const DatalistInput = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = '',
  category = null
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const context = useContext(AppContext);
  const listId = `datalist_${Math.random().toString(36).substr(2, 9)}`;

  const handleChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    // Add to dropdown options if it's a new value and category is provided
    if (category && newValue && !options.includes(newValue)) {
      context?.addDropdownOption(category, newValue);
    }
  };

  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium mb-2">{label}</label>}
      <input
        type="text"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        list={listId}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
};
