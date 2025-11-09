import { useId, FC, ReactNode, InputHTMLAttributes } from "react";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: ReactNode;
  help?: ReactNode;
  value: string | number;
  onChange: (value: string) => void;
  conClassName?: string;
}

const Input: FC<InputProps> = ({
  label,
  type = "text",
  help,
  value,
  onChange,
  className,
  conClassName,
  ...props
}) => {
  const inputId = useId();

  return (
    <div className={`wpab-input-con ${conClassName ? conClassName : ""}`}>
      <label className="wpab-input-label" htmlFor={inputId}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value ?? ""}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        className={`wpab-input${className ? ` ${className}` : ""}`}
        {...props}
      />
      {help && <span className="wpab-input-help">{help}</span>}
    </div>
  );
};

export default Input;
