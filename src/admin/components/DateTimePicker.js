import { date, getDate } from "@wordpress/date";
import { useState, useEffect } from "react";

export default function DateTimePicker({
  dateTime,
  onDateTimeChange,
  disabled = false,
  timezone,
  wpSettings,
  ...props
}) {
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
  useEffect(() => {
    loadTime();
  }, [wpSettings, timezone]);
  useEffect(() => {
    const timer = setInterval(loadTime, 6000);
    return () => clearInterval(timer);
  }, []);

  const loadTime = () => {
    const offset = timezone?.offset * 60;
    const localTime = new Date();
    const format = `${wpSettings?.dateFormat} ${wpSettings?.timeFormat}`;
    const formatedDate = date(format, localTime, timezone?.offset);
    setCurrentTime(formatedDate);
  };
  return (
    <>
      <input
        className="wpab-input w-100 "
        type="datetime-local"
        value={dateTime}
        onChange={(e) =>
          onDateTimeChange(e.target.value.replace("T", " ").slice(0, 16))
        }
        disabled={disabled}
      />
      {timezone && wpSettings && (
        <p className="campaignbay-text-xs campaignbay-text-gray-500 mt-1">
          Current time: {currentTime}
        </p>
      )}
    </>
  );
}
