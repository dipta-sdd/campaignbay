import React, {
  useState,
  useEffect,
  useRef,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Check,
  ChevronDown,
} from "lucide-react";
import { useCbStore } from "../../store/cbStore";
import { date, getSettings as getDateSettings } from "@wordpress/date";
import {
  errorWithInClasses,
  hoverClassesManual,
  hoverWithInClasses,
} from "../common/classes";
import { Column, Row } from "../../pages/Campaigns";
import formatDateTime from "../../utils/Dates";

interface DateTimePickerProps {
  inputRef?: React.Ref<HTMLDivElement>;
  label?: string | React.ReactNode;
  value?: string | Date | null;
  onChange: (date: string) => void;
  use24Hour?: boolean;
  className?: string;
  disabled?: boolean;
  min?: string | Date;
  max?: string | Date;
  error?: string;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const AM_PM = ["AM", "PM"];

const ITEM_HEIGHT = 40;

// Helper to format date to 'YYYY-MM-DD HH:mm'
const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const d = date.getDate().toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return `${y}-${m}-${d} ${h}:${min}`;
};

// Helper to parse input to Date object
const parseDate = (val: string | Date | null): Date | null => {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

interface TimeColumnProps {
  items: (number | string)[];
  selectedValue: number | string;
  onChange: (val: number | string) => void;
  infiniteScroll?: boolean;
}

const TimeColumn: React.FC<TimeColumnProps> = ({
  items,
  selectedValue,
  onChange,
  infiniteScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const loopedItems = useMemo(
    () => (infiniteScroll ? [...items, ...items, ...items] : items),
    [items, infiniteScroll],
  );
  const singleSetHeight = items.length * ITEM_HEIGHT;

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const index = items.indexOf(selectedValue as any);
    if (index !== -1) {
      if (infiniteScroll) {
        const middleSetIndex = items.length + index;
        container.scrollTop = middleSetIndex * ITEM_HEIGHT;
      } else {
        container.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [infiniteScroll, items, selectedValue]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!infiniteScroll) return;
    const container = e.currentTarget;
    const scrollTop = container.scrollTop;
    if (scrollTop < ITEM_HEIGHT) {
      container.scrollTop = scrollTop + singleSetHeight;
    } else if (scrollTop > singleSetHeight * 2) {
      container.scrollTop = scrollTop - singleSetHeight;
    }
  };

  const handleItemClick = (val: number | string) => {
    onChange(val);
  };

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="campaignbay-h-[280px] campaignbay-w-[50px] campaignbay-overflow-y-auto scrollbar-hide campaignbay-flex campaignbay-flex-col campaignbay-relative"
    >
      <div className="campaignbay-flex campaignbay-flex-col campaignbay-w-full">
        {loopedItems.map((item, i) => {
          const isSelected = item === selectedValue;
          return (
            <div
              key={`${item}-${i}`}
              className="campaignbay-flex-shrink-0 campaignbay-h-[40px] campaignbay-w-full campaignbay-flex campaignbay-items-center campaignbay-justify-center"
            >
              <button
                onClick={() => handleItemClick(item)}
                className={`campaignbay-w-10 campaignbay-h-10 campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-sm campaignbay-transition-all campaignbay-duration-200 campaignbay-rounded-md
                                    ${
                                      isSelected
                                        ? "campaignbay-bg-[#183ad6] campaignbay-text-white campaignbay-font-bold campaignbay-shadow-sm"
                                        : "hover:campaignbay-bg-[#183ad650] "
                                    }
                                `}
              >
                {typeof item === "number"
                  ? item.toString().padStart(2, "0")
                  : item}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CustomDateTimePicker: React.FC<DateTimePickerProps> = ({
  inputRef,
  label,
  value,
  onChange,
  use24Hour = false,
  className,
  disabled = false,
  error,
  min,
  max,
}) => {
  // Helper to get Server Date
  // Replace the implementation of this function to return your server time.
  const { wpSettings } = useCbStore();
  const { timezone } = getDateSettings();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  useEffect(() => {
    loadTime();
  }, [wpSettings, timezone]);
  useEffect(() => {
    const timer = setInterval(loadTime, 6000);
    return () => clearInterval(timer);
  }, []);

  const loadTime = () => {
    const localTime = new Date();
    const format = `${wpSettings?.dateFormat} ${wpSettings?.timeFormat}`;
    const formatedDate = date(format, localTime, timezone?.offset);
    setCurrentTime(formatedDate);
  };
  const getServerDate = (): Date => {
    return new Date(currentTime);
  };

  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<"bottom" | "top">("bottom");
  const containerRef = useRef<HTMLDivElement>(null);
  const activeYearRef = useRef<HTMLButtonElement>(null);

  // Navigation state for calendar
  const [navMonth, setNavMonth] = useState(getServerDate().getMonth());
  const [navYear, setNavYear] = useState(getServerDate().getFullYear());
  const [view, setView] = useState<"dates" | "months">("dates");
  const [expandedYear, setExpandedYear] = useState<number | null>(null);

  // Refs for all individual character inputs
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Local state for formatted strings
  const [inputs, setInputs] = useState({
    month: "", // "MM"
    day: "", // "DD"
    year: "", // "YYYY"
    hour: "", // "HH"
    minute: "", // "mm"
    ampm: "", // "AM" or "PM"
  });

  const parsedValue = useMemo(() => parseDate(value as string), [value]);
  const minDate = useMemo(
    () => (min ? parseDate(min as string | Date) : getServerDate()),
    [min, currentTime],
  );
  const maxDate = useMemo(() => parseDate(max as string | Date), [max]);

  // Helper to check if a date is within range (inclusive)
  const isDateInRange = (d: Date) => {
    if (minDate && d < minDate) return false;
    if (maxDate && d > maxDate) return false;
    return true;
  };

  // Helper to check if a DAY (ignoring time) is disabled
  const isDayDisabled = (d: Date) => {
    const checkDate = new Date(d);
    checkDate.setHours(0, 0, 0, 0);

    if (minDate) {
      const minDay = new Date(minDate);
      minDay.setHours(0, 0, 0, 0);
      if (checkDate < minDay) return true;
    }
    if (maxDate) {
      const maxDay = new Date(maxDate);
      maxDay.setHours(0, 0, 0, 0);
      if (checkDate > maxDay) return true;
    }
    return false;
  };

  // Sync external value to inputs
  useEffect(() => {
    if (parsedValue) {
      let hour = parsedValue.getHours();
      let ampm = "";

      if (!use24Hour) {
        ampm = hour >= 12 ? "PM" : "AM";
        hour = hour % 12 || 12;
      }

      setInputs({
        month: (parsedValue.getMonth() + 1).toString().padStart(2, "0"),
        day: parsedValue.getDate().toString().padStart(2, "0"),
        year: parsedValue.getFullYear().toString(),
        hour: hour.toString().padStart(2, "0"),
        minute: parsedValue.getMinutes().toString().padStart(2, "0"),
        ampm: ampm,
      });
      // Also sync nav state
      setNavMonth(parsedValue.getMonth());
      setNavYear(parsedValue.getFullYear());
    } else {
      // Keep empty but sized strings so we don't have issues
      setInputs({
        month: "  ",
        day: "  ",
        year: "    ",
        hour: "  ",
        minute: "  ",
        ampm: "  ",
      });
    }
  }, [parsedValue, use24Hour]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset view when closed
  useEffect(() => {
    if (!isOpen) {
      setView("dates");
    }
  }, [isOpen]);

  // Auto-expand current navYear when view opens
  useEffect(() => {
    if (view === "months") {
      setExpandedYear(navYear);
    }
  }, [view, navYear]);

  // Scroll effect for year selection
  useEffect(() => {
    if (view === "months" && activeYearRef.current) {
      setTimeout(() => {
        activeYearRef.current?.scrollIntoView({
          block: "center",
          behavior: "auto",
        });
      }, 0);
    }
  }, [view]);

  const toggleOpen = () => {
    if (disabled) return;
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Estimate dropdown height as ~350px
      const dropdownHeight = 350;
      const spaceBelow = window.innerHeight - rect.bottom;

      if (spaceBelow < dropdownHeight && rect.top > dropdownHeight) {
        setDropdownPos("top");
      } else {
        setDropdownPos("bottom");
      }
    }
    setIsOpen(!isOpen);
  };

  const updateDateFromInputs = (newInputs: typeof inputs) => {
    const { month, day, year, hour, minute, ampm } = newInputs;

    // Basic validation: ensure all fields have content (checking against spaces)
    if (
      month.trim().length !== 2 ||
      day.trim().length !== 2 ||
      year.trim().length !== 4 ||
      hour.trim().length !== 2 ||
      minute.trim().length !== 2
    )
      return;

    if (!use24Hour && ampm.trim().length !== 2) return;

    const m = parseInt(month, 10);
    let d = parseInt(day, 10);
    const y = parseInt(year, 10);
    let h = parseInt(hour, 10);
    const min = parseInt(minute, 10);

    // Range checks
    if (m < 1 || m > 12) return;

    // Correct day if it exceeds days in month (e.g. Feb 31 -> Feb 28)
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) {
      d = daysInMonth;
    }

    if (d < 1) return; // d > 31 is handled by daysInMonth check roughly, but logic holds.
    if (y < 1000 || y > 9999) return;
    if (min < 0 || min > 59) return;

    if (use24Hour) {
      if (h < 0 || h > 23) return;
    } else {
      if (h < 1 || h > 12) return;
      // Convert to 24h for Date object
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
    }

    const newDate = new Date(y, m - 1, d, h, min);

    // Validate range
    if (minDate && newDate < minDate) return;
    if (maxDate && newDate > maxDate) return;

    onChange(formatDate(newDate));
  };

  // Helper to replace character at index while maintaining string length
  const replaceCharAt = (
    str: string,
    index: number,
    char: string,
    maxLength: number,
  ) => {
    // Pad with spaces if needed to ensure we have a scaffold
    const padded = str.padEnd(maxLength, " ");
    const chars = padded.split("");
    chars[index] = char;
    return chars.join("").substring(0, maxLength);
  };

  const handleCharChange = (
    section: keyof typeof inputs,
    charIndex: number,
    val: string,
    globalIndex: number,
  ) => {
    // AM/PM Toggle Logic
    if (section === "ampm") {
      const next = inputs.ampm.trim() === "AM" ? "PM" : "AM";
      const newInputs = { ...inputs, ampm: next };
      setInputs(newInputs);
      updateDateFromInputs(newInputs);
      return;
    }

    // Numeric Validation
    if (!/^\d*$/.test(val)) return;

    const maxLength = section === "year" ? 4 : 2;

    // Construct new string for the section
    const rawNewVal = replaceCharAt(
      inputs[section] || "",
      charIndex,
      val,
      maxLength,
    );

    let formattedVal = rawNewVal;
    const numVal = parseInt(rawNewVal.trim(), 10);

    if (!isNaN(numVal)) {
      if (section === "month") {
        if (numVal > 12) formattedVal = "12";
        else if (
          numVal === 0 &&
          rawNewVal.trim().length === 2 &&
          rawNewVal.indexOf(" ") === -1
        )
          formattedVal = "01";
      } else if (section === "day") {
        if (numVal > 31) formattedVal = "31";
        else if (
          numVal === 0 &&
          rawNewVal.trim().length === 2 &&
          rawNewVal.indexOf(" ") === -1
        )
          formattedVal = "01";
      } else if (section === "hour") {
        if (use24Hour) {
          if (numVal > 23) formattedVal = "23";
        } else {
          if (numVal > 12) formattedVal = "12";
          else if (
            numVal === 0 &&
            rawNewVal.trim().length === 2 &&
            rawNewVal.indexOf(" ") === -1
          )
            formattedVal = "12";
        }
      } else if (section === "minute") {
        if (numVal > 59) formattedVal = "59";
      }
    }

    const newInputs = { ...inputs, [section]: formattedVal };
    setInputs(newInputs);

    // Auto-advance only if we typed a character (not empty) and we are not at the end
    if (val !== "") {
      const nextInput = inputsRef.current[globalIndex + 1];
      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
      updateDateFromInputs(newInputs);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    section: keyof typeof inputs,
    charIndex: number,
    globalIndex: number,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const maxLength = section === "year" ? 4 : 2;
      const currentStr = inputs[section] || "";

      const charAtCursor = currentStr[charIndex];

      if (charAtCursor && charAtCursor !== " ") {
        const newVal = replaceCharAt(currentStr, charIndex, " ", maxLength);
        const newInputs = { ...inputs, [section]: newVal };
        setInputs(newInputs);
        updateDateFromInputs(newInputs);
      } else {
        if (globalIndex > 0) {
          const prevInput = inputsRef.current[globalIndex - 1];
          if (prevInput) {
            prevInput.focus();
          }
        }
      }
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      if (globalIndex > 0) {
        inputsRef.current[globalIndex - 1]?.focus();
        inputsRef.current[globalIndex - 1]?.select();
      }
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      if (globalIndex < inputsRef.current.length - 1) {
        inputsRef.current[globalIndex + 1]?.focus();
        inputsRef.current[globalIndex + 1]?.select();
      }
    } else if (e.key === "Enter") {
      setIsOpen(false);
    } else if (/^\d$/.test(e.key) && section !== "ampm") {
      // Direct digit handling for smoother typing of same digits
      e.preventDefault();
      handleCharChange(section, charIndex, e.key, globalIndex);
    }
  };

  // --- Render Helpers ---

  const renderCharInput = (
    section: keyof typeof inputs,
    charIndex: number,
    globalIndex: number,
    placeholder: string,
  ) => {
    const char = (inputs[section] || "")[charIndex];
    const displayVal = char === " " ? "" : char || "";
    const isAmPm = section === "ampm";

    return (
      <input
        key={`${section}-${charIndex}`}
        ref={(el) => {
          inputsRef.current[globalIndex] = el;
        }}
        style={{
          backgroundColor: "transparent",
          height: "unset !important",
          minHeight: "unset !important",
          width: "15px",
        }}
        type="text"
        inputMode={section === "ampm" ? "text" : "numeric"}
        maxLength={1}
        placeholder={placeholder}
        value={displayVal}
        disabled={disabled}
        onChange={(e) =>
          handleCharChange(section, charIndex, e.target.value, globalIndex)
        }
        onKeyDown={(e) => handleKeyDown(e, section, charIndex, globalIndex)}
        onFocus={(e) => e.target.select()}
        className={`campaignbay-bg-transparent !campaignbay-bg-gray-200 !campaignbay-text-center 
          !campaignbay-outline-none !campaignbay-border-none !campaignbay-shadow-none focus:!campaignbay-bg-[#183ad6] focus:!campaignbay-text-white focus:!campaignbay-outline-none focus:!campaignbay-border-none focus:!campaignbay-shadow-none !campaignbay-rounded-none !campaignbay-px-0 !campaignbay-py-0 campaignbay-transition-colors campaignbay-w-[1.2ch] campaignbay-mx-[1px] campaignbay-text-[13px] campaignbay-leading-[16px] campaignbay-font-[400] campaignbay-text-[#1e1e1e] ${
            isAmPm
              ? "campaignbay-cursor-pointer campaignbay-caret-transparent selection:campaignbay-bg-transparent"
              : ""
          } ${disabled ? "campaignbay-cursor-not-allowed" : ""}`}
        onClick={(e) => {
          // For AM/PM, toggle immediately on click
          if (section === "ampm") {
            handleCharChange("ampm", 0, "", 0);
            e.currentTarget.blur();
          } else {
            e.stopPropagation();
          }
        }}
      />
    );
  };

  // --- Calendar Handlers ---
  const handlePrevMonth = () => {
    if (navMonth === 0) {
      setNavMonth(11);
      setNavYear(navYear - 1);
    } else {
      setNavMonth(navMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (navMonth === 11) {
      setNavMonth(0);
      setNavYear(navYear + 1);
    } else {
      setNavMonth(navMonth + 1);
    }
  };

  const handleDateClick = (day: number) => {
    const currentDate = parsedValue || getServerDate();
    const newDate = new Date(currentDate);
    newDate.setFullYear(navYear);
    newDate.setMonth(navMonth);
    newDate.setDate(day);
    onChange(formatDate(newDate));
  };

  const handleTimeColumnChange = (
    type: "hour" | "minute" | "ampm",
    val: number | string,
  ) => {
    const currentDate = parsedValue || getServerDate();
    const newDate = new Date(currentDate);

    if (type === "hour") {
      let h = val as number;
      if (!use24Hour) {
        const currentHours = newDate.getHours();
        const isPm = currentHours >= 12;
        if (isPm && h < 12) h += 12;
        if (isPm && h === 12) h = 12;
        if (!isPm && h === 12) h = 0;
      }
      newDate.setHours(h);
    } else if (type === "minute") {
      newDate.setMinutes(val as number);
    } else if (type === "ampm") {
      const currentHours = newDate.getHours();
      if (val === "PM" && currentHours < 12) {
        newDate.setHours(currentHours + 12);
      } else if (val === "AM" && currentHours >= 12) {
        newDate.setHours(currentHours - 12);
      }
    }
    onChange(formatDate(newDate));
  };

  const renderMonthYearSelection = () => {
    const currentYear = getServerDate().getFullYear();
    // Allow +/- 50 years
    const startYear = currentYear - 50;
    const years = Array.from({ length: 100 }, (_, i) => startYear + i);

    return (
      <div className="campaignbay-absolute campaignbay-inset-0 campaignbay-bg-white !campaignbay-border-none campaignbay-z-[9999] campaignbay-overflow-y-auto scrollbar-hide campaignbay-rounded-lg">
        {years.map((year) => (
          <div
            key={year}
            className="campaignbay-border-b campaignbay-border-[#bdc4d1]"
          >
            <button
              ref={year === navYear ? activeYearRef : null}
              disabled={
                !!(
                  (minDate && year < minDate.getFullYear()) ||
                  (maxDate && year > maxDate.getFullYear())
                )
              }
              onClick={() =>
                setExpandedYear(expandedYear === year ? null : year)
              }
              className={`campaignbay-w-full campaignbay-text-left campaignbay-px-2 campaignbay-py-1.5 campaignbay-text-sm campaignbay-font-medium campaignbay-flex campaignbay-justify-between campaignbay-items-center campaignbay-transition-colors ${
                year === navYear
                  ? "campaignbay-bg-blue-50 campaignbay-text-blue-700"
                  : "campaignbay-text-gray-600 hover:campaignbay-bg-gray-50"
              } disabled:campaignbay-opacity-50 disabled:campaignbay-cursor-not-allowed`}
            >
              <span>{year}</span>
              <ChevronDown
                className={`campaignbay-w-4 campaignbay-h-4 campaignbay-transition-transform campaignbay-duration-200 ${
                  expandedYear === year ? "campaignbay-rotate-180" : ""
                }`}
              />
            </button>

            {expandedYear === year && (
              <div className="campaignbay-grid campaignbay-grid-cols-4 campaignbay-gap-2 campaignbay-p-2 campaignbay-bg-gray-50 campaignbay-animate-in campaignbay-slide-in-from-top-2 campaignbay-duration-150">
                {MONTHS.map((m, i) => (
                  <button
                    key={m}
                    onClick={() => {
                      setNavYear(year);
                      setNavMonth(i);
                      setView("dates");
                    }}
                    disabled={
                      !!(
                        (minDate &&
                          (year < minDate.getFullYear() ||
                            (year === minDate.getFullYear() &&
                              i < minDate.getMonth()))) ||
                        (maxDate &&
                          (year > maxDate.getFullYear() ||
                            (year === maxDate.getFullYear() &&
                              i > maxDate.getMonth())))
                      )
                    }
                    className={`campaignbay-py-1.5 campaignbay-pt-1 campaignbay-text-xs campaignbay-rounded-[4px] campaignbay-transition-colors campaignbay-border disabled:campaignbay-opacity-50 disabled:campaignbay-cursor-not-allowed ${
                      i === navMonth && year === navYear
                        ? "campaignbay-bg-[#183ad6] campaignbay-border-[#183ad6] campaignbay-text-white campaignbay-shadow-sm campaignbay-font-medium"
                        : "campaignbay-bg-white campaignbay-border-[#bdc4d1] campaignbay-text-gray-700 hover:!campaignbay-border-[#183ad6] hover:!campaignbay-bg-[#183ad6] hover:!campaignbay-text-white"
                    }`}
                  >
                    {m.substring(0, 3)}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarGrid = () => {
    const daysInMonth = new Date(navYear, navMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(navYear, navMonth, 1).getDay();
    const daysInPrevMonth = new Date(navYear, navMonth, 0).getDate();

    const totalSlots = 42; // 6 rows * 7 columns
    const days = [];

    // 1. Previous Month Days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const date = new Date(navYear, navMonth - 1, dayNum);

      days.push(
        <button
          key={`prev-${dayNum}`}
          disabled={isDayDisabled(date)}
          onClick={() => {
            onChange(formatDate(date));
            setNavMonth(date.getMonth());
            setNavYear(date.getFullYear());
          }}
          className={`campaignbay-h-8 campaignbay-w-8 campaignbay-rounded-full campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-sm campaignbay-text-gray-500 hover:campaignbay-bg-gray-100 campaignbay-transition-colors ${
            isDayDisabled(date)
              ? "campaignbay-opacity-30 campaignbay-cursor-not-allowed hover:!campaignbay-bg-transparent"
              : ""
          }`}
        >
          {dayNum}
        </button>,
      );
    }

    // 2. Current Month Days
    for (let i = 1; i <= daysInMonth; i++) {
      const isSelected =
        parsedValue &&
        parsedValue.getDate() === i &&
        parsedValue.getMonth() === navMonth &&
        parsedValue.getFullYear() === navYear;

      const serverDate = getServerDate();
      const isToday =
        serverDate.getDate() === i &&
        serverDate.getMonth() === navMonth &&
        serverDate.getFullYear() === navYear;

      const currentDayDate = new Date(navYear, navMonth, i);
      days.push(
        <button
          key={`curr-${i}`}
          disabled={isDayDisabled(currentDayDate)}
          onClick={() => handleDateClick(i)}
          className={`campaignbay-h-8 campaignbay-w-8 campaignbay-rounded-full campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-sm campaignbay-transition-colors
                        ${
                          isSelected
                            ? "campaignbay-bg-[#183ad6] campaignbay-text-white campaignbay-font-bold"
                            : "campaignbay-text-gray-700 hover:campaignbay-bg-gray-100"
                        }
                        ${
                          isToday && !isSelected
                            ? "campaignbay-border campaignbay-border-[#183ad6] campaignbay-text-[#183ad6]"
                            : ""
                        }
                        ${
                          isDayDisabled(currentDayDate)
                            ? "campaignbay-opacity-30 campaignbay-cursor-not-allowed hover:!campaignbay-bg-transparent"
                            : ""
                        }
                    `}
        >
          {i}
        </button>,
      );
    }

    // 3. Next Month Days
    const remainingSlots = totalSlots - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const date = new Date(navYear, navMonth + 1, i);
      days.push(
        <button
          key={`next-${i}`}
          disabled={isDayDisabled(date)}
          onClick={() => {
            onChange(formatDate(date));
            setNavMonth(date.getMonth());
            setNavYear(date.getFullYear());
          }}
          className={`campaignbay-h-8 campaignbay-w-8 campaignbay-rounded-full campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-sm campaignbay-text-gray-500 hover:campaignbay-bg-gray-100 campaignbay-transition-colors ${
            isDayDisabled(date)
              ? "campaignbay-opacity-30 campaignbay-cursor-not-allowed hover:!campaignbay-bg-transparent"
              : ""
          }`}
        >
          {i}
        </button>,
      );
    }

    return days;
  };

  const safeDate = parsedValue || getServerDate();
  const currentHour24 = safeDate.getHours();
  const currentHour12 = currentHour24 % 12 || 12;
  const currentMinute = safeDate.getMinutes();
  const isPm = currentHour24 >= 12;

  // Filter Time Options
  const getFilteredHours = () => {
    let hours = use24Hour ? HOURS_24 : HOURS_12;
    if (minDate && safeDate.toDateString() === minDate.toDateString()) {
      const minH = minDate.getHours();
      hours = hours.filter((h) => {
        if (use24Hour) return (h as number) >= minH;
        // 12-hour logic
        let h24 = h as number;
        if (isPm && h24 < 12) h24 += 12;
        if (isPm && h24 === 12) h24 = 12;
        if (!isPm && h24 === 12) h24 = 0;
        return h24 >= minH;
      });
    }
    if (maxDate && safeDate.toDateString() === maxDate.toDateString()) {
      const maxH = maxDate.getHours();
      hours = hours.filter((h) => {
        if (use24Hour) return (h as number) <= maxH;
        // 12-hour logic
        let h24 = h as number;
        if (isPm && h24 < 12) h24 += 12;
        if (isPm && h24 === 12) h24 = 12;
        if (!isPm && h24 === 12) h24 = 0;
        return h24 <= maxH;
      });
    }
    return hours;
  };

  const getFilteredMinutes = () => {
    let minutes = MINUTES;
    if (
      minDate &&
      safeDate.toDateString() === minDate.toDateString() &&
      safeDate.getHours() === minDate.getHours()
    ) {
      minutes = minutes.filter((m) => (m as number) >= minDate.getMinutes());
    }
    if (
      maxDate &&
      safeDate.toDateString() === maxDate.toDateString() &&
      safeDate.getHours() === maxDate.getHours()
    ) {
      minutes = minutes.filter((m) => (m as number) <= maxDate.getMinutes());
    }
    return minutes;
  };

  const separatorClass =
    "campaignbay-text-gray-400 dark:campaignbay-text-gray-500 campaignbay-mx-0.5 campaignbay-select-none";

  let gIdx = 0;

  return (
    <div
      className={`campaignbay-relative ${className || ""}`}
      ref={containerRef}
    >
      {label && (
        <label className="campaignbay-block campaignbay-text-[11px] campaignbay-leading-[16px] campaignbay-font-[400] campaignbay-text-[#1e1e1e] campaignbay-font-bold campaignbay-mb-1">
          {label}
        </label>
      )}

      <div
        ref={inputRef}
        className={`campaignbay-flex campaignbay-items-center campaignbay-w-full campaignbay-border campaignbay-border-[#bdc4d1]  campaignbay-px-[4px] campaignbay-py-[1px] campaignbay-rounded-[8px] campaignbay-shadow-none campaignbay-transition-all ${
          disabled
            ? "campaignbay-bg-gray-100 campaignbay-cursor-not-allowed campaignbay-opacity-60"
            : hoverWithInClasses + " campaignbay-bg-white"
        }
        ${isOpen ? hoverClassesManual : ""}
        ${error ? errorWithInClasses : ""}`}
        onClick={(e) => {
          if (disabled) return;
          // Only focus first element if we clicked the CONTAINER background, not an input
          if (e.target === e.currentTarget) {
            inputsRef.current[0]?.focus();
          }
        }}
      >
        <div className="campaignbay-flex-grow campaignbay-flex campaignbay-items-center campaignbay-pl-1 campaignbay-cursor-text campaignbay-text-base ">
          {/* Month */}
          {renderCharInput("month", 0, gIdx++, "M")}
          {renderCharInput("month", 1, gIdx++, "M")}
          <span className={separatorClass}>/</span>

          {/* Day */}
          {renderCharInput("day", 0, gIdx++, "D")}
          {renderCharInput("day", 1, gIdx++, "D")}
          <span className={separatorClass}>/</span>

          {/* Year */}
          {renderCharInput("year", 0, gIdx++, "Y")}
          {renderCharInput("year", 1, gIdx++, "Y")}
          {renderCharInput("year", 2, gIdx++, "Y")}
          {renderCharInput("year", 3, gIdx++, "Y")}

          <span
            className={`${separatorClass} campaignbay-ml-2 campaignbay-mr-1`}
          >
            ,
          </span>

          {/* Hour */}
          <div className="campaignbay-flex campaignbay-items-center campaignbay-ml-2">
            {renderCharInput("hour", 0, gIdx++, "-")}
            {renderCharInput("hour", 1, gIdx++, "-")}
            <span className={separatorClass}>:</span>

            {/* Minute */}
            {renderCharInput("minute", 0, gIdx++, "-")}
            {renderCharInput("minute", 1, gIdx++, "-")}

            {/* AM/PM */}
            {!use24Hour && (
              <>
                <span className="campaignbay-w-1"></span>
                {renderCharInput("ampm", 0, gIdx++, "-")}
                {renderCharInput("ampm", 1, gIdx++, "-")}
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={toggleOpen}
          disabled={disabled}
          className={`campaignbay-p-2 campaignbay-border-l campaignbay-border-[#bdc4d1] campaignbay-transition-colors campaignbay-group ${
            disabled
              ? "campaignbay-cursor-not-allowed"
              : "hover:campaignbay-bg-[#bdc4d1]"
          }`}
        >
          <CalendarIcon
            className={`campaignbay-w-5 campaignbay-h-5 campaignbay-text-gray-400 campaignbay-transition-colors ${
              disabled ? "" : "group-hover:campaignbay-text-[#183ad6]"
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div
          className={`campaignbay-absolute campaignbay-z-[99999] campaignbay-bg-white  campaignbay-rounded-lg  campaignbay-border campaignbay-border-[#bdc4d1] campaignbay-flex campaignbay-flex-row campaignbay-items-stretch campaignbay-right-0 ${
            dropdownPos === "top"
              ? "campaignbay-bottom-full"
              : "campaignbay-top-full"
          }`}
          style={
            dropdownPos === "top"
              ? {
                  marginBottom: "-19px",
                  boxShadow: "0px -3px 6px rgba(0, 0, 0, 0.3)",
                }
              : {
                  marginTop: "1px",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                }
          }
        >
          <Column className="!campaignbay-gap-0">
            <Row className="!campaignbay-items-start !campaignbay-gap-0">
              <div className="campaignbay-p-3 campaignbay-border-r campaignbay-border-[#bdc4d1] campaignbay-w-64 campaignbay-flex-shrink-0 campaignbay-rounded-l-lg">
                <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-mb-2">
                  {view === "dates" && (
                    <button
                      onClick={handlePrevMonth}
                      className="campaignbay-p-1 hover:campaignbay-bg-gray-100 campaignbay-rounded-full campaignbay-text-gray-600"
                    >
                      <ChevronLeft className="campaignbay-w-5 campaignbay-h-5" />
                    </button>
                  )}

                  <button
                    onClick={() =>
                      setView(view === "dates" ? "months" : "dates")
                    }
                    className={`campaignbay-flex campaignbay-items-center campaignbay-gap-1 campaignbay-font-semibold campaignbay-text-gray-900 hover:campaignbay-bg-gray-100 campaignbay-px-2 campaignbay-py-1 campaignbay-rounded campaignbay-transition-colors ${
                      view === "months" ? "campaignbay-mx-auto" : ""
                    }`}
                  >
                    <span className="campaignbay-text-sm ">
                      {MONTHS[navMonth]} {navYear}
                    </span>
                    <ChevronDown
                      className={`campaignbay-w-4 campaignbay-h-4 campaignbay-transition-transform campaignbay-duration-200 ${
                        view === "months" ? "campaignbay-rotate-180" : ""
                      }`}
                    />
                  </button>

                  {view === "dates" && (
                    <button
                      onClick={handleNextMonth}
                      className="campaignbay-p-1 hover:campaignbay-bg-gray-100 campaignbay-rounded-full campaignbay-text-gray-600"
                    >
                      <ChevronRight className="campaignbay-w-5 campaignbay-h-5" />
                    </button>
                  )}
                </div>

                {/* Calendar / Selection Container */}
                <div className="campaignbay-relative">
                  {/* Dates Grid View */}
                  <div
                    className={`campaignbay-grid campaignbay-grid-cols-7 campaignbay-gap-1 campaignbay-content-start campaignbay-transition-opacity campaignbay-duration-200 ${
                      view === "dates"
                        ? "campaignbay-opacity-100"
                        : "campaignbay-opacity-0"
                    }`}
                  >
                    {DAYS.map((d) => (
                      <div
                        key={d}
                        className="campaignbay-h-8 campaignbay-w-8 campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-xs campaignbay-font-medium campaignbay-text-gray-400"
                      >
                        {d}
                      </div>
                    ))}
                    {renderCalendarGrid()}
                  </div>

                  {/* Month/Year Selection Overlay */}
                  {view === "months" && renderMonthYearSelection()}
                </div>
              </div>

              <div className="campaignbay-bg-gray-50 campaignbay-w-auto campaignbay-flex-shrink-0 campaignbay-flex campaignbay-flex-col campaignbay-p-[12px]  campaignbay-rounded-r-lg">
                <div className="campaignbay-flex campaignbay-justify-center campaignbay-h-[284px] campaignbay-relative campaignbay-w-full">
                  <div className="campaignbay-flex campaignbay-w-full campaignbay-items-start campaignbay-gap-0">
                    <TimeColumn
                      items={getFilteredHours()}
                      selectedValue={use24Hour ? currentHour24 : currentHour12}
                      onChange={(v) => handleTimeColumnChange("hour", v)}
                    />
                    <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-font-bold campaignbay-text-gray-400 campaignbay-w-2 campaignbay-h-[315px] campaignbay-pb-0.5">
                      :
                    </div>
                    <TimeColumn
                      items={getFilteredMinutes()}
                      selectedValue={currentMinute}
                      onChange={(v) => handleTimeColumnChange("minute", v)}
                    />
                    {!use24Hour && (
                      <>
                        <div className="campaignbay-w-2"></div>
                        <TimeColumn
                          items={AM_PM}
                          selectedValue={isPm ? "PM" : "AM"}
                          onChange={(v) => handleTimeColumnChange("ampm", v)}
                          infiniteScroll={false}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Row>
            <div className="campaignbay-w-full campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-p-[4px] campaignbay-border-t campaignbay-border-[#bdc4d1]">
              <button
                className="campaignbay-text-xs campaignbay-font-bold campaignbay-text-[#183ad6] hover:campaignbay-text-blue-800 campaignbay-px-2 campaignbay-py-1 campaignbay-transition-colors disabled:campaignbay-opacity-50 disabled:campaignbay-cursor-not-allowed disabled:hover:campaignbay-text-[#183ad6]"
                disabled={!isDateInRange(getServerDate())}
                onClick={() => {
                  const now = getServerDate();
                  if (!isDateInRange(now)) return;
                  onChange(formatDate(now));
                  setNavMonth(now.getMonth());
                  setNavYear(now.getFullYear());
                  setView("dates");
                }}
              >
                Today
                <span className="campaignbay-text-[#1e1e1e] campaignbay-font-normal campaignbay-text-xs">
                  {" (" + formatDateTime(getServerDate().toString()) + ")"}
                </span>
              </button>
              <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-2">
                <button
                  className="campaignbay-text-xs campaignbay-font-medium campaignbay-text-gray-500 hover:campaignbay-text-gray-700 campaignbay-px-2 campaignbay-py-1 campaignbay-transition-colors"
                  onClick={() => {
                    onChange("");
                    setIsOpen(false);
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="campaignbay-w-max campaignbay-px-2 campaignbay-py-1 campaignbay-bg-[#183ad6] hover:campaignbay-bg-blue-700 campaignbay-text-white campaignbay-text-sm campaignbay-font-medium campaignbay-rounded-md campaignbay-shadow-sm campaignbay-transition-colors campaignbay-flex campaignbay-items-center campaignbay-justify-center"
                >
                  <Check className="campaignbay-w-4 campaignbay-h-4 campaignbay-mr-1" />{" "}
                  Done
                </button>
              </div>
            </div>
          </Column>
        </div>
      )}

      <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
    </div>
  );
};

export default CustomDateTimePicker;
