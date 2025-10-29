import React, { useId, FC, ReactNode, SelectHTMLAttributes } from "react";

interface SelectOption {
  id?: string | number;
  label: string;
  value: string | number;
}
// @ts-ignore
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: ReactNode;
  help?: ReactNode;
  options?: SelectOption[];
  value: string | number;
  onChange: (value: string) => void;
  conClassName?: string;
}

const Select: FC<SelectProps> = ({
  label,
  help,
  options = [],
  value,
  onChange,
  className,
  conClassName,
  ...props
}) => {
  const selectId = useId();

  return (
    <div className={`wpab-input-con ${conClassName ? conClassName : ""}`}>
      <label className="wpab-input-label" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        value={value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
          onChange(e.target.value)
        }
        className={`wpab-select${className ? ` ${className}` : ""}`}
        {...props}
      >
        {options?.map((option, index) => {
          const key = option.id || `${option.label}-${option.value}-${index}`;
          return (
            <option key={key} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </select>
      {help && <span className="wpab-input-help">{help}</span>}
    </div>
  );
};

export default Select;
