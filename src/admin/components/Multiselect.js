import { useId, useRef, useState, useEffect } from '@wordpress/element';
import { X } from 'lucide-react';

const MultiSelect = ({
    label,
    help,
    options = [],
    value = [],
    onChange,
    className,
    ...props
}) => {
    const selectId = useId();
    const [inputValue, setInputValue] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const inputRef = useRef();
    const listRef = useRef();

    // Filter options by input and remove already selected
    const filteredOptions = options.filter(
        (option) =>
            !value.includes(option.value) &&
            option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    useEffect(() => {
        // Reset highlight when filter changes
        setHighlightedIndex(0);
    }, [inputValue, filteredOptions.length]);

    const handleSelect = (val) => {
        onChange([...value, val]);
        setInputValue('');
        setDropdownOpen(true);
        inputRef.current.focus();
    };

    const handleRemove = (val) => {
        onChange(value.filter((v) => v !== val));
    };

    const handleKeyDown = (e) => {
        if (!dropdownOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            setDropdownOpen(true);
            return;
        }
        if (dropdownOpen) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev < filteredOptions.length - 1 ? prev + 1 : 0
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setHighlightedIndex((prev) =>
                    prev > 0 ? prev - 1 : filteredOptions.length - 1
                );
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredOptions[highlightedIndex]) {
                    handleSelect(filteredOptions[highlightedIndex].value);
                }
            } else if (e.key === 'Escape') {
                setDropdownOpen(false);
            }
        }
    };

    return (
        <div className={`wpab-input-con${className ? ' ' + className : ''}`}>
            <label className="wpab-input-label" htmlFor={selectId}>{label}</label>
            <div
                className="wpab-multiselect-input"
                onClick={() => {
                    setDropdownOpen(true);
                    inputRef.current.focus();
                }}
            >
                {value.map((val) => {
                    const option = options.find((o) => o.value === val);
                    return (
                        <span
                            key={val}
                            className="wpab-multiselect-tag"
                        >
                            {option?.label || val}
                            <button
                                type="button"
                                className="wpab-multiselect-tag-remove"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemove(val);
                                }}
                                aria-label={`Remove ${option?.label || val}`}
                            >
                                <X />
                            </button>
                        </span>
                    );
                })}
                <input
                    id={selectId}
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onFocus={() => setDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 100)}
                    className="wpab-multiselect-inputfield"
                    onKeyDown={handleKeyDown}
                    {...props}
                    disabled={options.length === 0}
                    placeholder='Type to search...'
                />
                {dropdownOpen && filteredOptions.length > 0 && (
                    <ul
                        ref={listRef}
                        className="wpab-multiselect-dropdown"
                    >
                        {filteredOptions.map((option, idx) => (
                            <li
                                key={option.value}
                                className={`wpab-multiselect-option${idx === highlightedIndex ? ' wpab-multiselect-option--highlighted' : ''}`}
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