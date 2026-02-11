import React, { Dispatch, SetStateAction } from "react";
import { CalendarDay } from "./CampaignCalendarPage";
import { areDatesSameDay, useCalendar } from "./useCalender";
import { useCbStoreActions } from "../../store/cbStore";

// --- Helper Icon Components ---
export const ChevronLeftIcon: React.FC<{ className?: string }> = ({
  className = "campaignbay-w-6 campaignbay-h-6",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 19.5L8.25 12l7.5-7.5"
    />
  </svg>
);

export const ChevronRightIcon: React.FC<{ className?: string }> = ({
  className = "campaignbay-w-6 campaignbay-h-6",
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.25 4.5l7.5 7.5-7.5 7.5"
    />
  </svg>
);

// --- Calendar Header Component ---
export interface CalendarHeaderProps {
  view: "date" | "month" | "year";
  monthName: string;
  year: number;
  yearViewStart: number;
  onPrev: () => void;
  onNext: () => void;
  onGoToToday?: () => void;
  onTitleClick: () => void;
  headerId: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  view,
  monthName,
  year,
  yearViewStart,
  onPrev,
  onNext,
  onGoToToday,
  onTitleClick,
  headerId,
}) => {
  const getHeaderText = () => {
    switch (view) {
      case "month":
        return (
          <button
            onClick={onTitleClick}
            className="campaignbay-font-[700] campaignbay-text-[16px] campaignbay-text-[#1e1e1e]   hover:campaignbay-text-[#3858e9] campaignbay-transition-colors"
            aria-label={`Select year, current year is ${year}`}
          >
            {year}
          </button>
        );
      case "year":
        return (
          <span className="campaignbay-font-[700] campaignbay-text-[16px] campaignbay-text-[#1e1e1e]  ">{`${yearViewStart} - ${
            yearViewStart + 19
          }`}</span>
        );
      case "date":
      default:
        return (
          <button
            onClick={onTitleClick}
            className="campaignbay-font-[700] campaignbay-text-[16px] campaignbay-text-[#1e1e1e]   hover:campaignbay-text-primary campaignbay-transition-colors campaignbay-flex campaignbay-items-center campaignbay-gap-1.5"
            aria-label={`Select month and year, current view is ${monthName} ${year}`}
          >
            <span>{monthName}</span>
            <span className="campaignbay-font-normal">{year}</span>
          </button>
        );
    }
  };

  const getAriaLabels = () => {
    switch (view) {
      case "month":
        return { prev: "Previous year", next: "Next year" };
      case "year":
        return { prev: "Previous 20 years", next: "Next 20 years" };
      case "date":
      default:
        return { prev: "Previous month", next: "Next month" };
    }
  };
  const { prev, next } = getAriaLabels();

  return (
    <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between ">
      <div
        id={headerId}
        className="campaignbay-flex campaignbay-items-center campaignbay-gap-[16px]"
      >
        {getHeaderText()}
      </div>
      <div className="campaignbay-flex campaignbay-items-center campaignbay-gap-[16px]">
        {view === "date" && (
          <button
            onClick={onGoToToday}
            className="campaignbay-px-4 campaignbay-py-2 campaignbay-text-sm campaignbay-font-medium campaignbay-text-gray-600 campaignbay-bg-gray-100 campaignbay-rounded-lg hover:campaignbay-bg-gray-200 focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-[#3858e9] campaignbay-transition-colors"
          >
            Today
          </button>
        )}
        <button
          onClick={onPrev}
          aria-label={prev}
          className="campaignbay-p-2 campaignbay-text-gray-500 campaignbay-rounded-full hover:campaignbay-bg-gray-100 focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-[#3858e9] campaignbay-transition-colors"
        >
          <ChevronLeftIcon />
        </button>
        <button
          onClick={onNext}
          aria-label={next}
          className="campaignbay-p-2 campaignbay-text-gray-500 campaignbay-rounded-full hover:campaignbay-bg-gray-100 focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-[#3858e9] campaignbay-transition-colors"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
};

// --- Date View Component ---
const DateView: React.FC<{
  daysOfWeek: string[];
  calendarGrid: CalendarDay[];
  onSelectDate: (date: Date) => void;
  focusedDate: Date;
  onKeyDown: (e: React.KeyboardEvent) => void;
  headerId: string;
  cellRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
  variant: "circle" | "rounded" | "bordered" | "campaignbay-grid" | "gridFill";
  renderDayContent?: (day: CalendarDay) => React.ReactNode;
}> = ({
  daysOfWeek,
  calendarGrid,
  onSelectDate,
  focusedDate,
  onKeyDown,
  headerId,
  cellRefs,
  variant,
  renderDayContent,
}) => {
  const rowsCount = Math.ceil(calendarGrid.length / 7);

  if (variant === "campaignbay-grid" || variant === "gridFill") {
    const dateRows = Array.from({ length: rowsCount }, (_, i) =>
      calendarGrid.slice(i * 7, i * 7 + 7),
    );
    return (
      <div
        role="campaignbay-grid"
        aria-labelledby={headerId}
        onKeyDown={onKeyDown}
        className="focus:campaignbay-outline-none campaignbay-border-t campaignbay-border-l campaignbay-border-gray-200"
      >
        <div role="row" className="campaignbay-grid campaignbay-grid-cols-7">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              role="columnheader"
              aria-label={day}
              className="campaignbay-text-center campaignbay-text-sm campaignbay-font-semibold campaignbay-text-gray-500 campaignbay-py-2 campaignbay-border-r campaignbay-border-b campaignbay-border-gray-200"
            >
              {day.substring(0, 3)}
            </div>
          ))}
        </div>
        {dateRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            role="row"
            className="campaignbay-grid campaignbay-grid-cols-7"
          >
            {row.map((day) => {
              const {
                isCurrentMonth,
                isToday,
                hasEvent,
                isSelected,
                date,
                dayOfMonth,
              } = day;
              const isFocused = areDatesSameDay(date, focusedDate);

              let cellClasses =
                "campaignbay-relative campaignbay-border-r campaignbay-border-b campaignbay-border-gray-200";
              if (!isCurrentMonth) {
                cellClasses += " campaignbay-bg-gray-50";
              }
              if (variant === "gridFill" && isSelected) {
                cellClasses += " campaignbay-bg-[#3858e9]";
              }

              let buttonClasses =
                "campaignbay-w-full campaignbay-h-16 campaignbay-p-1 campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center focus:campaignbay-outline-none focus:campaignbay-ring-1 focus:campaignbay-ring-inset focus:campaignbay-ring-[#3858e9] campaignbay-transition-colors";
              if (!(variant === "gridFill" && isSelected)) {
                buttonClasses += " hover:campaignbay-bg-gray-100";
              }

              let numberWrapperClasses =
                "campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-w-7 campaignbay-h-7 campaignbay-rounded-full campaignbay-transition-colors campaignbay-text-sm campaignbay-font-medium";
              if (isSelected) {
                if (variant === "campaignbay-grid") {
                  numberWrapperClasses +=
                    " campaignbay-bg-[#3858e9] campaignbay-text-white campaignbay-font-bold";
                } else {
                  // gridFill
                  numberWrapperClasses +=
                    " campaignbay-text-white campaignbay-font-bold";
                }
              } else if (isToday) {
                numberWrapperClasses +=
                  " campaignbay-bg-blue-100 campaignbay-text-blue-800";
              }

              if (!isCurrentMonth && !isSelected && !isToday) {
                numberWrapperClasses += " campaignbay-text-gray-400";
              } else if (isCurrentMonth && !isSelected && !isToday) {
                numberWrapperClasses += " campaignbay-text-gray-700";
              }

              const eventDotClasses = `campaignbay-w-1.5 campaignbay-h-1.5 campaignbay-rounded-full ${
                variant === "gridFill" && isSelected
                  ? "campaignbay-bg-white"
                  : "campaignbay-bg-[#3858e9]"
              }`;

              return (
                <div
                  key={date.toDateString()}
                  role="gridcell"
                  className={cellClasses}
                >
                  <button
                    ref={(node) => {
                      const key = date.toDateString();
                      if (node) cellRefs.current.set(key, node);
                      else cellRefs.current.delete(key);
                    }}
                    className={buttonClasses}
                    onClick={() => onSelectDate(date)}
                    aria-selected={isSelected}
                    aria-label={`${date.toDateString()}${
                      hasEvent ? ", has event" : ""
                    }`}
                    tabIndex={isFocused ? 0 : -1}
                  >
                    <span className={numberWrapperClasses}>{dayOfMonth}</span>
                    {renderDayContent
                      ? renderDayContent(day)
                      : hasEvent && (
                          <div className="campaignbay-w-full campaignbay-flex campaignbay-justify-center campaignbay-items-center campaignbay-pt-1">
                            <span className={eventDotClasses}></span>
                          </div>
                        )}
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  const dateRows = Array.from({ length: rowsCount }, (_, i) =>
    calendarGrid.slice(i * 7, i * 7 + 7),
  );

  return (
    <div
      role="campaignbay-grid"
      aria-labelledby={headerId}
      onKeyDown={onKeyDown}
      className="focus:campaignbay-outline-none"
    >
      <div role="row" className="campaignbay-grid campaignbay-grid-cols-7">
        {daysOfWeek.map((day) => (
          <div
            key={day}
            role="columnheader"
            aria-label={day}
            className="campaignbay-text-center campaignbay-text-sm campaignbay-font-semibold campaignbay-text-gray-500 campaignbay-py-2"
          >
            {day.substring(0, 3)}
          </div>
        ))}
      </div>
      {dateRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          role="row"
          className="campaignbay-grid campaignbay-grid-cols-7"
        >
          {row.map((day) => {
            const {
              isCurrentMonth,
              isToday,
              hasEvent,
              isSelected,
              date,
              dayOfMonth,
            } = day;
            const isFocused = areDatesSameDay(date, focusedDate);

            let dayClasses =
              "campaignbay-relative campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-h-12 campaignbay-w-12 campaignbay-transition-colors campaignbay-duration-200 campaignbay-ease-in-out campaignbay-text-md focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-[#3858e9] ";

            // Variant-specific shape and base styles
            if (variant === "circle") {
              dayClasses += " campaignbay-rounded-full";
            } else if (variant === "rounded") {
              dayClasses += " campaignbay-rounded-lg";
            } else if (variant === "bordered") {
              dayClasses +=
                " campaignbay-border-2 campaignbay-border-transparent";
            }

            // State-specific styles
            if (isSelected) {
              if (variant === "bordered") {
                dayClasses +=
                  " campaignbay-border-[#3858e9] campaignbay-bg-blue-100 campaignbay-text-blue-800 campaignbay-font-bold";
              } else {
                dayClasses +=
                  " campaignbay-bg-[#3858e9] campaignbay-text-white campaignbay-font-bold hover:campaignbay-bg-blue-600";
              }
            } else if (isToday) {
              if (variant === "bordered") {
                dayClasses +=
                  " campaignbay-border-gray-400 campaignbay-text-gray-800 campaignbay-font-semibold";
              } else {
                dayClasses +=
                  " campaignbay-bg-blue-100 campaignbay-text-blue-800 campaignbay-font-semibold";
              }
            } else if (isCurrentMonth) {
              if (variant === "bordered") {
                dayClasses +=
                  " campaignbay-text-gray-700 hover:campaignbay-border-gray-300";
              } else {
                dayClasses +=
                  " campaignbay-text-gray-700 hover:campaignbay-bg-blue-100";
              }
            } else {
              dayClasses += " campaignbay-text-gray-400";
            }
            if (!isCurrentMonth) dayClasses += " campaignbay-cursor-default";

            return (
              <div
                key={date.toDateString()}
                role="gridcell"
                className="campaignbay-flex campaignbay-justify-center campaignbay-items-center"
              >
                <button
                  ref={(node) => {
                    const key = date.toDateString();
                    if (node) cellRefs.current.set(key, node);
                    else cellRefs.current.delete(key);
                  }}
                  className={dayClasses}
                  onClick={() => isCurrentMonth && onSelectDate(date)}
                  aria-selected={isSelected}
                  aria-label={`${date.toDateString()}${
                    hasEvent ? ", has event" : ""
                  }`}
                  aria-disabled={!isCurrentMonth}
                  tabIndex={isFocused ? 0 : -1}
                >
                  {dayOfMonth}
                  {renderDayContent
                    ? renderDayContent(day)
                    : hasEvent &&
                      isCurrentMonth && (
                        <span
                          className={`campaignbay-absolute campaignbay-bottom-1.5 campaignbay-left-1/2 -translate-x-1/2 campaignbay-w-1.5 campaignbay-h-1.5 campaignbay-rounded-full ${
                            isSelected && variant !== "bordered"
                              ? "campaignbay-bg-white"
                              : "campaignbay-bg-[#3858e9]"
                          }`}
                          aria-hidden="true"
                        ></span>
                      )}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- Month View Component ---
const MonthView: React.FC<{
  monthNames: string[];
  currentYear: number;
  onSelectMonth: (monthIndex: number) => void;
  focusedDate: Date;
  onKeyDown: (e: React.KeyboardEvent) => void;
  headerId: string;
  cellRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}> = ({
  monthNames,
  currentYear,
  onSelectMonth,
  focusedDate,
  onKeyDown,
  headerId,
  cellRefs,
}) => {
  const monthRows = [
    monthNames.slice(0, 4),
    monthNames.slice(4, 8),
    monthNames.slice(8, 12),
  ];

  return (
    <div
      role="campaignbay-grid"
      aria-labelledby={headerId}
      onKeyDown={onKeyDown}
      className="focus:campaignbay-outline-none"
    >
      {monthRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          role="row"
          className="campaignbay-grid campaignbay-grid-cols-4 campaignbay-gap-2 campaignbay-mb-2"
        >
          {row.map((month) => {
            const monthIndex = monthNames.indexOf(month);
            const isFocused = focusedDate.getMonth() === monthIndex;
            const isSelected =
              new Date().getFullYear() === currentYear &&
              new Date().getMonth() === monthIndex;

            let monthClasses =
              "campaignbay-p-4 campaignbay-h-20 campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-center campaignbay-rounded-lg campaignbay-cursor-pointer campaignbay-transition-colors campaignbay-duration-200 campaignbay-ease-in-out focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-[#3858e9] ";
            if (isSelected) {
              monthClasses +=
                "campaignbay-bg-[#3858e9] campaignbay-text-white campaignbay-font-bold";
            } else {
              monthClasses +=
                "hover:campaignbay-bg-blue-100 campaignbay-text-gray-700";
            }

            return (
              <div
                key={month}
                role="gridcell"
                className="campaignbay-flex campaignbay-justify-center campaignbay-items-center"
              >
                <button
                  ref={(node) => {
                    if (node) cellRefs.current.set(month, node);
                    else cellRefs.current.delete(month);
                  }}
                  onClick={() => onSelectMonth(monthIndex)}
                  className={monthClasses}
                  tabIndex={isFocused ? 0 : -1}
                  aria-label={month}
                >
                  {month}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- Year View Component ---
const YearView: React.FC<{
  yearGrid: number[];
  currentYear: number;
  onSelectYear: (year: number) => void;
  focusedDate: Date;
  onKeyDown: (e: React.KeyboardEvent) => void;
  headerId: string;
  cellRefs: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}> = ({
  yearGrid,
  currentYear,
  onSelectYear,
  focusedDate,
  onKeyDown,
  headerId,
  cellRefs,
}) => {
  const yearRows = [
    yearGrid.slice(0, 5),
    yearGrid.slice(5, 10),
    yearGrid.slice(10, 15),
    yearGrid.slice(15, 20),
  ];

  return (
    <div
      role="campaignbay-grid"
      aria-labelledby={headerId}
      onKeyDown={onKeyDown}
      className="focus:campaignbay-outline-none"
    >
      {yearRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          role="row"
          className="campaignbay-grid campaignbay-grid-cols-5 campaignbay-gap-2 campaignbay-mb-2"
        >
          {row.map((year) => {
            const isCurrentYear = year === currentYear;
            const isFocused = focusedDate.getFullYear() === year;

            let yearClasses =
              "campaignbay-p-4 campaignbay-h-16 campaignbay-flex campaignbay-items-center campaignbay-justify-center campaignbay-text-center campaignbay-rounded-lg campaignbay-cursor-pointer campaignbay-transition-colors campaignbay-duration-200 campaignbay-ease-in-out focus:campaignbay-outline-none focus:campaignbay-ring-2 focus:campaignbay-ring-offset-2 focus:campaignbay-ring-[#3858e9] ";
            if (isCurrentYear) {
              yearClasses +=
                "campaignbay-bg-[#3858e9] campaignbay-text-white campaignbay-font-bold";
            } else {
              yearClasses +=
                "hover:campaignbay-bg-blue-100 campaignbay-text-gray-700";
            }
            return (
              <div
                key={year}
                role="gridcell"
                className="campaignbay-flex campaignbay-justify-center campaignbay-items-center"
              >
                <button
                  ref={(node) => {
                    const key = year.toString();
                    if (node) cellRefs.current.set(key, node);
                    else cellRefs.current.delete(key);
                  }}
                  onClick={() => onSelectYear(year)}
                  className={yearClasses}
                  tabIndex={isFocused ? 0 : -1}
                  aria-label={year.toString()}
                >
                  {year}
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- Main Calendar Component ---
const Calendar: React.FC<{
  hasEvent?: (date: Date) => boolean;
  renderDayContent?: (day: CalendarDay) => React.ReactNode;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  children?: React.ReactNode;
  variant?: "circle" | "rounded" | "bordered" | "campaignbay-grid" | "gridFill";
  className?: string;
}> = ({
  hasEvent,
  renderDayContent,
  selectedDate,
  onSelectDate,
  children,
  variant = "rounded",
  className,
}) => {
  const { serverDate } = useCbStoreActions();
  const {
    view,
    setView,
    currentMonth,
    currentMonthName,
    currentYear,
    daysOfWeek,
    monthNames,
    calendarGrid,
    yearGrid,
    yearViewStart,
    focusedDate,
    goToNextMonth,
    goToPrevMonth,
    goToNextYear,
    goToPrevYear,
    goToNextDecade,
    goToPrevDecade,
    goToToday,
    selectMonth,
    selectYear,
    handleKeyDown,
    areDatesSameDay,
  } = useCalendar({ hasEvent, selectedDate, onSelectDate, today: serverDate });

  const cellRefs = React.useRef(new Map<string, HTMLButtonElement>());
  const headerId = React.useId();

  React.useEffect(() => {
    let key: string;
    if (view === "date") {
      key = focusedDate.toDateString();
    } else if (view === "month") {
      key = monthNames[focusedDate.getMonth()];
    } else {
      key = focusedDate.getFullYear().toString();
    }
    const node = cellRefs.current.get(key);
    if (node) {
      node.focus();
    }
  }, [focusedDate, view, monthNames]);

  const handleGridKeyDown = (e: React.KeyboardEvent) => {
    const selectKeys = ["Enter", " "];
    if (selectKeys.includes(e.key)) {
      e.preventDefault();
      if (view === "date") {
        onSelectDate(focusedDate);
      } else if (view === "month") {
        selectMonth(focusedDate.getMonth());
      } else if (view === "year") {
        selectYear(focusedDate.getFullYear());
      }
    } else {
      handleKeyDown(e);
    }
  };

  const handleTitleClick = () => {
    if (view === "date") {
      setView("month");
    } else if (view === "month") {
      setView("year");
    }
  };

  const headerNavProps = {
    date: {
      onPrev: goToPrevMonth,
      onNext: goToNextMonth,
      onGoToToday: goToToday,
    },
    month: { onPrev: goToPrevYear, onNext: goToNextYear },
    year: { onPrev: goToPrevDecade, onNext: goToNextDecade },
  }[view];

  const renderView = () => {
    const commonProps = {
      onKeyDown: handleGridKeyDown,
      headerId,
      cellRefs,
      focusedDate,
    };
    switch (view) {
      case "month":
        return (
          <MonthView
            monthNames={monthNames}
            currentYear={currentYear}
            onSelectMonth={selectMonth}
            {...commonProps}
          />
        );
      case "year":
        return (
          <YearView
            yearGrid={yearGrid}
            currentYear={currentYear}
            onSelectYear={selectYear}
            {...commonProps}
          />
        );
      case "date":
      default:
        return (
          <DateView
            daysOfWeek={daysOfWeek}
            calendarGrid={calendarGrid}
            onSelectDate={onSelectDate}
            variant={variant}
            renderDayContent={renderDayContent}
            {...commonProps}
          />
        );
    }
  };

  const containerClass =
    className !== undefined
      ? className
      : "campaignbay-w-full campaignbay-max-campaignbay-w-2xl campaignbay-mx-auto campaignbay-bg-white campaignbay-shadow-2xl campaignbay-rounded-2xl campaignbay-p-6 campaignbay-transition-colors";

  return (
    <div className={containerClass}>
      <CalendarHeader
        view={view}
        monthName={currentMonthName}
        year={currentYear}
        yearViewStart={yearViewStart}
        onTitleClick={handleTitleClick}
        headerId={headerId}
        {...headerNavProps}
      />
      <div className="campaignbay-mt-2">{renderView()}</div>
      {children && (
        <div className="campaignbay-mt-6 campaignbay-pt-4 campaignbay-border-t campaignbay-border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default Calendar;
