import { useId } from "@wordpress/element";
import { check, Icon } from "@wordpress/icons";

const Checkbox = ({
  label,
  help,
  checked,
  onChange,
  className,
  conClassName,
  ...props
}) => {
  const inputId = useId();

  return (
    <div className={`wpab-input-con ${conClassName ? " " + conClassName : ""}`}>
      <div className="wpab-checkbox-con-inner">
        <div className="wpab-checkbox-con-inner-checkbox">
          <input
            id={inputId}
            type="checkbox"
            checked={!!checked}
            onChange={onChange}
            {...props}
            className={`wpab-checkbox${className ? " " + className : ""}`}
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
      <span className="wpab-input-help">{help}</span>
    </div>
  );
};

export default Checkbox;
