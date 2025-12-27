import React, {
  useId,
  useRef,
  useState,
  useEffect,
  FC,
  ReactNode,
  InputHTMLAttributes,
} from "react";
import { X } from "lucide-react";
import { SelectOptionType } from "../types";

// Define the component's props, extending standard input attributes
interface MultiSelectProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  con_ref?: React.Ref<HTMLDivElement>;
  label: ReactNode;
  help?: ReactNode;
  options?: SelectOptionType[];
  value?: number[];
  onChange:
    | React.Dispatch<React.SetStateAction<number[]>>
    | ((value: number[]) => void);
  className?: string;
}

const MultiSelect: FC<MultiSelectProps> = ({
  con_ref,
  label,
  help,
  options = [],
  value = [],
  onChange,
  className,
  ...props
}) => {
  const selectId = useId();
  const [inputValue, setInputValue] = useState<string>("");
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options by input and remove already selected
  const filteredOptions: SelectOptionType[] = options.filter(
    (option) =>
      // @ts-ignore
      !value.includes(option.value) &&
      option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    // Reset highlight when filter changes
    setHighlightedIndex(0);
  }, [inputValue, filteredOptions.length]);

  const handleSelect = (val: number) => {
    onChange([...value, val]);
    setInputValue("");
    setDropdownOpen(true);
    inputRef.current?.focus();
  };

  const handleRemove = (val: number) => {
    onChange(value.filter((v) => v !== val));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      setDropdownOpen(true);
      return;
    }
    if (dropdownOpen) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          handleSelect(filteredOptions[highlightedIndex].value);
        }
      } else if (e.key === "Escape") {
        setDropdownOpen(false);
      }
    }
  };

  useEffect(() => {
    if (dropdownOpen && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLLIElement;

      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest", // Scrolls the minimum amount to bring the element into view
          behavior: "smooth", // Optional: for a smoother scrolling effect
        });
      }
    }
  }, [highlightedIndex, dropdownOpen]); // Rerun this effect when the index or dropdown state changes

  return (
    <div className={`wpab-input-con${className ? ` ${className}` : ""}`}>
      <label className="wpab-input-label" htmlFor={selectId}>
        {label}
      </label>
      <div
        ref={con_ref}
        className="wpab-multiselect-input"
        onClick={() => {
          setDropdownOpen(true);
          inputRef.current?.focus();
        }}
      >
        {value.map((val) => {
          const option = options.find((o) => o.value === val);
          return (
            <span key={val} className="wpab-multiselect-tag">
              {option?.label || val}
              <button
                type="button"
                className="wpab-multiselect-tag-remove"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  handleRemove(val);
                }}
                aria-label={`Remove ${option?.label || val}`}
              >
                <X size={14} />
              </button>
            </span>
          );
        })}
        <input
          id={selectId}
          ref={inputRef}
          value={inputValue}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInputValue(e.target.value)
          }
          onFocus={() => setDropdownOpen(true)}
          onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
          className="wpab-multiselect-inputfield"
          onKeyDown={handleKeyDown}
          {...props}
          disabled={options.length === 0}
          placeholder="Type to search..."
        />
        {dropdownOpen && filteredOptions.length > 0 && (
          <ul ref={listRef} className="wpab-multiselect-dropdown">
            {filteredOptions.map((option, idx) => (
              <li
                key={option.value}
                className={`wpab-multiselect-option${
                  idx === highlightedIndex
                    ? " wpab-multiselect-option--highlighted"
                    : ""
                }`}
                onMouseDown={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(idx)}
              >
                {option.label}
              </li>
            ))}
          </ul>
        )}
      </div>
      {help && <span className="wpab-input-help">{help}</span>}
    </div>
  );
};

export default MultiSelect;
