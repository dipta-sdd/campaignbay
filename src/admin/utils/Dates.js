import { date, getDate, humanTimeDiff } from "@wordpress/date";
import { useCbStore } from "../store/cbStore";

export default function formatDateTime(dateTimeString) {
  const { wpSettings } = useCbStore();
  if (
    !dateTimeString ||
    new Date(dateTimeString).toString() === "Invalid Date"
  ) {
    return "—";
  }
  const format = `${wpSettings.dateFormat} ${wpSettings.timeFormat}`;
  const dateTime = getDate(dateTimeString);

  //   const currentTime = new Date().getTime();
  //   console.log(humanTimeDiff(dateTimeString, currentTime));

  return date(format, dateTime, null);
}
