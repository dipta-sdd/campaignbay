import { useId, forwardRef, InputHTMLAttributes } from "react";
import { check, Icon } from "@wordpress/icons";

interface CbCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
}

const CbCheckbox = forwardRef<HTMLInputElement, CbCheckboxProps>(({
  checked,
  onChange,
  className = "",
  ...props
}, ref) => {
  const inputId = useId();
  const fullClassName = `campaignbay-checkbox-single-checkbox${className ? ` ${className}` : ""
    }`;

  return (
    <div className="campaignbay-checkbox-single-checkbox-con">
      <input
        ref={ref}
        id={inputId}
        type="checkbox"
        checked={!!checked}
        onChange={onChange}
        {...props}
        className={fullClassName}
      />
      <Icon
        icon={check}
        className="campaignbay-checkbox-single-checkbox-icon"
      />
    </div>
  );
});

CbCheckbox.displayName = "CbCheckbox";

export default CbCheckbox;
