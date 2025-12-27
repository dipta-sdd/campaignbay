import React, { ReactNode } from "react";

interface CustomCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  disabledClassName?: string;
  icon?: ReactNode;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = "",
  activeClassName = "!campaignbay-bg-blue-600 !campaignbay-border-blue-600 !campaignbay-text-white !campaignbay-shadow-sm",
  disabledClassName = "!campaignbay-opacity-50 !campaignbay-cursor-not-allowed",
  icon,
}) => {
  return (
    <label
      className={`
        campaignbay-inline-flex campaignbay-items-center campaignbay-justify-center campaignbay-px-3 campaignbay-py-1
        campaignbay-text-[13px] campaignbay-leading-5 campaignbay-font-medium campaignbay-transition-colors campaignbay-duration-200 campaignbay-ease-in-out
        campaignbay-border campaignbay-select-none campaignbay-rounded-full campaignbay-cursor-pointer
        ${disabled ? disabledClassName : ""}
        ${
          checked
            ? activeClassName
            : "campaignbay-bg-white campaignbay-border-gray-300 campaignbay-text-gray-700 hover:border-gray-400 hover:bg-gray-50"
        }
        ${className}
      `}
    >
      <input
        type="checkbox"
        className="!sr-only "
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
      />
      <span>{label}</span>
      {icon && (
        <span className="campaignbay-ml-1.5 campaignbay-flex campaignbay-items-center">
          {icon}
        </span>
      )}
    </label>
  );
};

export default CustomCheckbox;
