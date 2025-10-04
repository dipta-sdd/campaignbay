import { useId } from "@wordpress/element";

const Input = ({
  label,
  type = "text",
  help,
  value,
  onChange,
  className,
  ...props
}) => {
  const inputId = useId();

  return (
    <div className="wpab-input-con">
      <label className="wpab-input-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={!!value}
        onChange={(e) => (
          console.log(e.target.value), onChange(e.target.value)
        )}
        className={`wpab-input${className ? " " + className : ""}`}
        {...props}
      />
      <span className="wpab-input-help">{help}</span>
    </div>
  );
};

export default Input;
