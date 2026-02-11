
// FIX: Import React to resolve "Cannot find namespace 'React'" error for React.KeyboardEvent type.
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { CalendarDay } from './CampaignCalendarPage';

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const areDatesSameDay = (date1: Date, date2: Date): boolean => {
    if (!date1 || !date2) return false;
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
};

export const useCalendar = ({
    hasEvent = () => false,
    selectedDate,
    onSelectDate,
    today
}: {
    hasEvent?: (date: Date) => boolean;
    selectedDate: Date;
    onSelectDate: (date: Date) => void;
    today: Date;
}) => {
    const [currentDate, setCurrentDate] = useState(selectedDate);
    const [view, setView] = useState<'date' | 'month' | 'year'>('date');
    const [focusedDate, setFocusedDate] = useState(selectedDate);

    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const currentMonthName = MONTH_NAMES[currentMonth];

    const [yearViewStart, setYearViewStart] = useState(Math.floor((currentYear - 1) / 20) * 20 + 1);

    useEffect(() => {
        setFocusedDate(selectedDate);
        if (!areDatesSameDay(currentDate, selectedDate)) {
            setCurrentDate(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        if (view === 'date' && (focusedDate.getFullYear() !== currentYear || focusedDate.getMonth() !== currentMonth)) {
            setCurrentDate(new Date(focusedDate.getFullYear(), focusedDate.getMonth(), 1));
        }
    }, [focusedDate, view, currentMonth, currentYear]);


    useEffect(() => {
        const newYearViewStart = Math.floor((currentYear - 1) / 20) * 20 + 1;
        setYearViewStart(newYearViewStart);
    }, [currentYear]);

    const goToNextMonth = () => {
        const newDate = new Date(currentYear, currentMonth + 1, 1);
        setCurrentDate(newDate);
        setFocusedDate(newDate);
    };

    const goToPrevMonth = () => {
        const newDate = new Date(currentYear, currentMonth - 1, 1);
        setCurrentDate(newDate);
        setFocusedDate(newDate);
    };

    const goToNextYear = () => {
        const newDate = new Date(currentYear + 1, currentMonth, 1);
        setCurrentDate(newDate);
        setFocusedDate(newDate);
    }

    const goToPrevYear = () => {
        const newDate = new Date(currentYear - 1, currentMonth, 1);
        setCurrentDate(newDate);
        setFocusedDate(newDate);
    }

    const goToNextDecade = () => {
        setYearViewStart(yearViewStart + 20);
    }

    const goToPrevDecade = () => {
        setYearViewStart(yearViewStart - 20);
    }

    const goToToday = () => {
        
        setFocusedDate(today);
        setCurrentDate(today);
        setView('date');
        onSelectDate(today);
    };

    const selectMonth = (monthIndex: number) => {
        const newDate = new Date(currentYear, monthIndex, 1);
        setCurrentDate(newDate);
        setFocusedDate(newDate);
        setView('date');
    };

    const selectYear = (year: number) => {
        const newDate = new Date(year, currentMonth, 1);
        setCurrentDate(newDate);
        setFocusedDate(newDate);
        setView('month');
    };

    const yearGrid = useMemo(() => {
        const years = [];
        for (let i = 0; i < 20; i++) {
            years.push(yearViewStart + i);
        }
        return years;
    }, [yearViewStart]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        let newDate = new Date(focusedDate);
        let navigationHandled = true;

        if (view === 'date') {
            switch (e.key) {
                case 'ArrowLeft': newDate.setDate(newDate.getDate() - 1); break;
                case 'ArrowRight': newDate.setDate(newDate.getDate() + 1); break;
                case 'ArrowUp': newDate.setDate(newDate.getDate() - 7); break;
                case 'ArrowDown': newDate.setDate(newDate.getDate() + 7); break;
                case 'PageUp':
                    newDate.setMonth(newDate.getMonth() - 1);
                    if (e.shiftKey) newDate.setFullYear(newDate.getFullYear() - 1);
                    break;
                case 'PageDown':
                    newDate.setMonth(newDate.getMonth() + 1);
                    if (e.shiftKey) newDate.setFullYear(newDate.getFullYear() + 1);
                    break;
                case 'Home': newDate.setDate(newDate.getDate() - newDate.getDay()); break;
                case 'End': newDate.setDate(newDate.getDate() + (6 - newDate.getDay())); break;
                default: navigationHandled = false;
            }
        } else if (view === 'month') {
            const currentMonth = newDate.getMonth();
            let newMonth = currentMonth;
            switch (e.key) {
                case 'ArrowLeft': newMonth = Math.max(0, currentMonth - 1); break;
                case 'ArrowRight': newMonth = Math.min(11, currentMonth + 1); break;
                case 'ArrowUp': newMonth = Math.max(0, currentMonth - 4); break;
                case 'ArrowDown': newMonth = Math.min(11, currentMonth + 4); break;
                case 'Home': newMonth = 0; break;
                case 'End': newMonth = 11; break;
                default: navigationHandled = false;
            }
            newDate.setMonth(newMonth);
        } else if (view === 'year') {
            const currentYear = newDate.getFullYear();
            const yearIndex = yearGrid.indexOf(currentYear);
            let newYear = currentYear;
            switch (e.key) {
                case 'ArrowLeft': if (yearIndex > 0) newYear = yearGrid[yearIndex - 1]; break;
                case 'ArrowRight': if (yearIndex < yearGrid.length - 1) newYear = yearGrid[yearIndex + 1]; break;
                case 'ArrowUp': if (yearIndex >= 5) newYear = yearGrid[yearIndex - 5]; break;
                case 'ArrowDown': if (yearIndex < yearGrid.length - 5) newYear = yearGrid[yearIndex + 5]; break;
                case 'Home': newYear = yearGrid[0]; break;
                case 'End': newYear = yearGrid[yearGrid.length - 1]; break;
                default: navigationHandled = false;
            }
            newDate.setFullYear(newYear);
        }

        if (navigationHandled) {
            e.preventDefault();
            setFocusedDate(newDate);
        }
    }, [view, focusedDate, yearGrid]);

  
    const calendarGrid: CalendarDay[] = useMemo(() => {
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

        const daysInMonth = lastDayOfMonth.getDate();
        const startDayOfWeek = firstDayOfMonth.getDay();

        const grid: CalendarDay[] = [];

        const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - 1, prevMonthLastDay - i);
            grid.push({
                date,
                dayOfMonth: date.getDate(),
                isCurrentMonth: false,
                isToday: areDatesSameDay(date, today),
                hasEvent: hasEvent(date),
                isSelected: areDatesSameDay(date, selectedDate),
            });
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(currentYear, currentMonth, i);
            grid.push({
                date,
                dayOfMonth: i,
                isCurrentMonth: true,
                isToday: areDatesSameDay(date, today),
                hasEvent: hasEvent(date),
                isSelected: areDatesSameDay(date, selectedDate),
            });
        }

        // Calculate remaining cells to complete the last week (row)
        // We do NOT force a fixed number of rows (e.g., 6 rows / 42 cells) to avoid extra empty rows.
        const remainingCells = (7 - (grid.length % 7)) % 7;
        for (let i = 1; i <= remainingCells; i++) {
            const date = new Date(currentYear, currentMonth + 1, i);
            grid.push({
                date,
                dayOfMonth: i,
                isCurrentMonth: false,
                isToday: areDatesSameDay(date, today),
                hasEvent: hasEvent(date),
                isSelected: areDatesSameDay(date, selectedDate),
            });
        }

        return grid;

    }, [currentMonth, currentYear, today, hasEvent, selectedDate]);

    return {
        currentMonth,
        currentMonthName,
        currentYear,
        daysOfWeek: DAYS_OF_WEEK,
        monthNames: MONTH_NAMES,
        calendarGrid,
        yearGrid,
        yearViewStart,
        view,
        setView,
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
    };
};
