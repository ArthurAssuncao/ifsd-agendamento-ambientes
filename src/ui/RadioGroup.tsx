import { useState } from "react";

type RadioOption = {
  value: string;
  label: string;
};

type RadioGroupProps = {
  options: RadioOption[];
  defaultValue?: string;
  onChange?: (value: string) => void;
  name: string;
};

export function RadioGroup({
  options,
  defaultValue,
  onChange,
  name,
}: RadioGroupProps) {
  const [selectedValue, setSelectedValue] = useState(defaultValue || "");

  const handleChange = (value: string) => {
    setSelectedValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <label
          key={option.value}
          className="flex items-center space-x-3 p-1 lg:p-2 cursor-pointer hover:bg-green-50 rounded-lg
 "
        >
          <div className="relative flex items-center justify-center">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={() => handleChange(option.value)}
              className="appearance-none h-6 w-6 border-2 border-gray-300 rounded-full 
                         checked:border-green-500 focus:outline-none focus:ring-2 
                         focus:ring-green-200 focus:ring-opacity-50 transition-all"
            />
            {selectedValue === option.value && (
              <div className="absolute h-6 w-6 top-0 flex items-center justify-center ">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            )}
          </div>
          <span
            className={`text-gray-700 h-6 text-ellipsis ${
              selectedValue === option.value && "font-bold"
            }`}
          >
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
