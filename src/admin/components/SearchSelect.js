import { useId, useRef, useState, useEffect } from '@wordpress/element';
import { X } from 'lucide-react';

const SearchSelect = ({
    label,
    help,
    options = [],
    value = null,
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
            option.value !== value &&
            option.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    useEffect(() => {
        // Reset highlight when filter changes
        setHighlightedIndex(0);
    }, [inputValue, filteredOptions.length]);

    const handleSelect = (val) => {
        onChange(val);
        setInputValue('');
        setDropdownOpen(false);
        inputRef.current.blur();
    };

    const handleRemove = () => {
        onChange(null);
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

    const selectedOption = options.find((o) => o.value === value);
    return (
        <div className={`wpab-search-select${className ? ' ' + className : ''}`}>
            <div
                className="wpab-multiselect-input"
                style={{ overflowX: value ? 'auto' : 'visible ' }}
                onClick={() => {
                    setDropdownOpen(true);
                    inputRef.current.focus();
                }}
            >
                {value ? (
                    <span
                        className="wpab-multiselect-tag"  
                    >
                        {selectedOption?.label || value}
                        <button
                            type="button"
                            className="wpab-multiselect-tag-remove"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleRemove();
                            }}
                            aria-label={`Remove ${selectedOption?.label || value}`}
                        >
                            <X />
                        </button>
                    </span>
                ) : (
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
                )}

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
        </div>
    );
};

export default SearchSelect;