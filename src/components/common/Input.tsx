import React from "react";
import { borderClasses, errorClasses, hoverClasses, transitionClasses } from "./classes";

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  size?: "small" | "medium" | "large";
  classNames?: {
    root?: string;
    label?: string;
    input?: string;
    error?: string;
  };
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  size = "medium",
  className = "",
  classNames,
  ...props
}) => {
  const sizeClasses = {
    small:
      "campaignbay-px-[8px] !campaignbay-py-[7px] campaignbay-text-[13px] campaignbay-leading-[20px]",
    medium:
      "campaignbay-px-[12px] !campaignbay-py-[9px] !campaignbay-text-[13px] !campaignbay-leading-[20px]",
    large:
      "campaignbay-px-[12px] !campaignbay-py-[11px] campaignbay-text-[13px] campaignbay-leading-[20px]",
  };

  return (
    <div className={`campaignbay-w-full ${classNames?.root || ""}`}>
      {label && (
        <label
          className={`campaignbay-block campaignbay-text-sm campaignbay-font-bold campaignbay-text-gray-900 campaignbay-mb-2 ${
            classNames?.label || ""
          }`}
        >
          {label}
        </label>
      )}
      <input
        className={`
          campaignbay-w-full campaignbay-outline-none
          campaignbay-bg-white campaignbay-border campaignbay-rounded-[8px]
          campaignbay-text-[#1e1e1e] campaignbay-placeholder-gray-400
          ${sizeClasses[size]}
          ${borderClasses}
          ${transitionClasses}
          ${error ? errorClasses : hoverClasses}
          ${
            props.disabled
              ? "campaignbay-opacity-50 campaignbay-cursor-not-allowed"
              : ""
          }
          ${className}
          ${classNames?.input || ""}
        `}
        {...props}
      />
      {error && (
        <span
          className={`campaignbay-mt-1 campaignbay-text-xs campaignbay-text-red-500 ${
            classNames?.error || ""
          }`}
        >
          {error}
        </span>
      )}
    </div>
  );
};
