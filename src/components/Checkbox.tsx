import React, { useId, FC, ReactNode, InputHTMLAttributes } from "react";
import { check, Icon } from "@wordpress/icons";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  help?: ReactNode;
  conClassName?: string;
}

const Checkbox: FC<CheckboxProps> = ({
  label,
  help,
  checked,
  onChange,
  className,
  conClassName,
  ...props
}) => {
  const inputId = useId();
  const fullContainerClassName = `wpab-input-con${
    conClassName ? ` ${conClassName}` : ""
  }`;
  const fullInputClassName = `wpab-checkbox${className ? ` ${className}` : ""}`;

  return (
    <div className={fullContainerClassName}>
      <div className="wpab-checkbox-con-inner">
        <div className="wpab-checkbox-con-inner-checkbox">
          <input
            id={inputId}
            type="checkbox"
            checked={!!checked}
            onChange={onChange}
            {...props}
            className={fullInputClassName}
          />
          <Icon
            icon={check}
            className="wpab-checkbox-icon"
            role="presentation"
          />
        </div>

        <label className="wpab-input-label" htmlFor={inputId}>
          {label}
        </label>
      </div>
      {help && <span className="wpab-input-help">{help}</span>}
    </div>
  );
};

export default Checkbox;
