import {
  useState,
  useEffect,
  FC,
  InputHTMLAttributes,
  useCallback,
} from "react";
import { date, TimezoneConfig } from "@wordpress/date";
import { WpSettings } from "../types";

interface DateTimePickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  dateTime: string | undefined | null | Date;
  onDateTimeChange: (dateTime: string) => void;
  disabled?: boolean;
  timezone: TimezoneConfig;
  wpSettings?: WpSettings;
}

const DateTimePicker: FC<DateTimePickerProps> = ({
  dateTime,
  onDateTimeChange,
  disabled = false,
  timezone,
  wpSettings,
  ...props
}) => {
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
  return (
    <>
      <input
        className="wpab-input w-100 "
        type="datetime-local"
        value={dateTime ? dateTime : ""}
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
};

export default DateTimePicker;
