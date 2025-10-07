import { useState, useEffect, useCallback } from "@wordpress/element";
import { Spinner, Button, ButtonGroup } from "@wordpress/components";
import apiFetch from "@wordpress/api-fetch";
import Modal from "./Modal";

const LogViewerModal = ({
  isLogModalOpen,
  setIsLogModalOpen,
  isClearingLogs,
  handleClearLogs,
}) => {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("today");
  const [logContent, setLogContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fetchAvailableDates = useCallback(async () => {
    try {
      const dates = await apiFetch({ path: "/campaignbay/v1/logs/list" });
      setAvailableDates(dates || []);
    } catch (error) {
      console.error("Error fetching log dates:", error);
      setAvailableDates([]);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    let path = "/campaignbay/v1/logs";
    if (selectedDate !== "today") {
      path = `/campaignbay/v1/logs/${selectedDate}`;
    }
    try {
      const response = await apiFetch({ path });
      setLogContent(
        response.log_content || `No logs found for ${selectedDate}.`
      );
    } catch (error) {
      setLogContent(`Error fetching logs: ${error.message}`);
    }
    setIsLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    if (isLogModalOpen) {
      fetchAvailableDates();
    }
  }, [isLogModalOpen, fetchAvailableDates]);

  useEffect(() => {
    if (isLogModalOpen) {
      fetchLogs();
    }
  }, [isLogModalOpen, fetchLogs]);

  const closeModal = () => {
    console.log("object");
    setIsLogModalOpen(false);
  };

  const onClearLogsClick = async () => {
    const success = await handleClearLogs();
    if (success) {
      setSelectedDate("today");
      fetchAvailableDates();
      fetchLogs();
    }
  };

  /**
   * --- NEW: Handler for the Download button ---
   * Creates a temporary link to download the current log content as a .log file.
   */
  const handleDownloadLog = () => {
    // Determine the filename.
    const dateStr =
      selectedDate === "today"
        ? new Date().toISOString().slice(0, 10)
        : selectedDate;
    const filename = `campaignbay-log-${dateStr}.log`;

    // Create a Blob (Binary Large Object) from the log content.
    const blob = new Blob([logContent], { type: "text/plain" });

    // Create a temporary URL for the Blob.
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download.
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a); // Append to the DOM to make it clickable.
    a.click();

    // Clean up by removing the temporary element and revoking the URL.
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isLogModalOpen) {
    return null;
  }
  return (
    <Modal
      title="Debug Log Viewer"
      onRequestClose={closeModal}
      className="wpab-cb-log-viewer-modal campaignbay-w-[90vw] md:campaignbay-w-[80vw] lg:campaignbay-w-[70vw] campaignbay-max-w-5xl campaignbay-rounded-none"
    >
      {/* Header section with the date selector and action buttons */}
      <div className="campaignbay-flex campaignbay-justify-between campaignbay-items-center campaignbay-mb-4 campaignbay-pb-4 campaignbay-border-b campaignbay-border-gray-200 campaignbay-gap-4">
        <div className="campaignbay-inline-flex campaignbay-justify-between campaignbay-items-center campaignbay-gap-4">
          <label
            htmlFor="log-date-selector"
            className="campaignbay-text-sm campaignbay-font-medium campaignbay-text-gray-700"
          >
            Select Log Date
          </label>
          <select
            id="log-date-selector"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="campaignbay-mt-1 campaignbay-block campaignbay-w-full md:campaignbay-w-auto campaignbay-pl-3 campaignbay-pr-10 campaignbay-py-2 campaignbay-text-base campaignbay-border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:campaignbay-text-sm campaignbay-rounded-md"
          >
            <option value="today">Today</option>
            {availableDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>
        {/* Your refined header with all buttons */}
        <div className="campaignbay-inline-flex campaignbay-justify-end campaignbay-gap-3">
          <button
            className="campaignbay-text-blue-600 hover:campaignbay-bg-blue-100 campaignbay-px-[12px] campaignbay-py-[6px] campaignbay-rounded-sm campaignbay-border campaignbay-border-blue-600 campaignbay-transition-colors disabled:campaignbay-text-blue-400"
            onClick={fetchLogs}
            isBusy={isLoading}
          >
            Refresh
          </button>
          {/* --- NEW: Download button --- */}
          <button
            className="campaignbay-text-blue-600 hover:campaignbay-bg-blue-100 campaignbay-px-[12px] campaignbay-py-[6px] campaignbay-rounded-sm campaignbay-border campaignbay-border-blue-600 campaignbay-transition-colors disabled:campaignbay-text-blue-400"
            onClick={handleDownloadLog}
            disabled={
              isLoading || !logContent || logContent.startsWith("No logs")
            }
          >
            Download
          </button>
          <button
            className="campaignbay-text-red-600 hover:campaignbay-bg-red-100 campaignbay-px-[12px] campaignbay-py-[6px] campaignbay-rounded-sm campaignbay-border campaignbay-border-red-200  campaignbay-transition-colors disabled:campaignbay-text-blue-400"
            onClick={onClearLogsClick}
            isBusy={isClearingLogs}
          >
            Clear Log Files
          </button>
        </div>
      </div>

      {/* Log content display */}
      <pre className="campaignbay-p-4 campaignbay-bg-gray-50 campaignbay-border campaignbay-border-gray-200 campaignbay-overflow-auto campaignbay-text-xs campaignbay-h-[50vh] campaignbay-scrollbar">
        {isLoading ? <Spinner /> : logContent}
      </pre>

      {/* The footer section is now removed as the buttons are in the header. */}
    </Modal>
  );
};

export default LogViewerModal;
