import { useId, FC, InputHTMLAttributes } from "react";
import { check, Icon } from "@wordpress/icons";

interface CbCheckboxProps extends InputHTMLAttributes<HTMLInputElement> {}

const CbCheckbox: FC<CbCheckboxProps> = ({
  checked,
  onChange,
  className = "",
  ...props
}) => {
  const inputId = useId();
  const fullClassName = `campaignbay-checkbox-single-checkbox${
    className ? ` ${className}` : ""
  }`;

  return (
    <div className="campaignbay-checkbox-single-checkbox-con">
      <input
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
};

export default CbCheckbox;
