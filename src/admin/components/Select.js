import { useId } from "@wordpress/element";

const Select = ({
  label,
  help,
  options = [],
  value,
  onChange,
  className,
  ...props
}) => {
  const selectId = useId();

  return (
    <div className="wpab-input-con">
      <label className="wpab-input-label" htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`wpab-select${className ? " " + className : ""}`}
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
      <span className="wpab-input-help">{help}</span>
    </div>
  );
};

export default Select;
