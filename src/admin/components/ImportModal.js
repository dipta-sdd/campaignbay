import { useState, useCallback } from "@wordpress/element";
import { __ } from "@wordpress/i18n";
import { Button } from "@wordpress/components";
import { Icon, upload } from "@wordpress/icons";
import { csvToJson } from "./csvToJson"; // Assuming your csvToJson file is in utils
import Modal from "./Modal";
/**
 * A modal for importing campaigns from a CSV file with drag-and-drop support.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to call when the modal should close.
 * @param {Function} props.onImport - Function to call with the parsed JSON data when the user confirms the import.
 */
const ImportModal = ({ isOpen, onClose, onImport }) => {
  const [jsonData, setJsonData] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  /**
   * A centralized function to process a single file object.
   * @param {File} file
   */
  const processFile = useCallback((file) => {
    if (!file) return;

    if (file.type && !file.type.match("text/csv")) {
      setError(
        __("Invalid file type. Please upload a .csv file.", "campaignbay")
      );
      return;
    }

    setError(null);
    setJsonData(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const requiredColumns = [
          "title",
          "status",
          "type",
          "discount_type",
          "discount_value",
          "target_type",
          "target_ids",
          "is_exclude",
          "tiers",
          "conditions",
          "settings",
          "exclude_sale_items",
          "schedule_enabled",
          "start_datetime",
          "end_datetime",
          "usage_limit",
          "usage_count",
        ];

        const parsedData = csvToJson(e.target.result, requiredColumns);
        if (parsedData.length > 0) {
          setHeaders(Object.keys(parsedData[0]));
          setJsonData(parsedData);
        } else {
          setError(
            __(
              "The CSV file is empty or does not contain data rows.",
              "campaignbay"
            )
          );
        }
      } catch (err) {
        setError(err.message);
      }
    };
    reader.onerror = () => {
      setError(__("Failed to read the file.", "campaignbay"));
    };
    reader.readAsText(file);
  }, []);

  /**
   * Handles file selection from the standard input field.
   */
  const handleFileChange = (event) => {
    processFile(event.target.files[0]);
  };

  /**
   * Handles the drag over event to allow dropping.
   */
  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  /**
   * Handles the drag leave event to reset visual state.
   */
  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  /**
   * Handles the file drop event.
   */
  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(false);

      const droppedFiles = event.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        processFile(droppedFiles[0]);
      }
    },
    [processFile]
  );

  const handleConfirmImport = () => {
    if (jsonData) {
      onImport(
        jsonData.map((item) => {
          return {
            ...item,
            tiers: item.tiers ? JSON.parse(item.tiers) : [],
            conditions: item.conditions ? JSON.parse(item.conditions) : {},
            settings: item.settings ? JSON.parse(item.settings) : {},
          };
        })
      );
    }
  };

  const handleClose = () => {
    setJsonData(null);
    setHeaders([]);
    setFileName("");
    setError(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const dropzoneClass = isDraggingOver
    ? "campaignbay-border-blue-500 campaignbay-bg-blue-50"
    : "campaignbay-border-gray-300 campaignbay-bg-gray-50 hover:campaignbay-bg-gray-100";

  return (
    <Modal
      size="large"
      title={__("Import Campaigns from CSV", "campaignbay")}
      onRequestClose={handleClose}
    >
      <div className="campaignbay-p-2">
        {jsonData ? (
          <div>
            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-mb-4">
              <h3 className="campaignbay-text-lg campaignbay-font-semibold campaignbay-text-gray-800">
                {__("Data Preview", "campaignbay")}
              </h3>
              <p className="campaignbay-text-sm campaignbay-text-gray-500">
                {fileName} - {jsonData.length} {__("rows found", "campaignbay")}
              </p>
            </div>
            <div className="campaignbay-overflow-auto campaignbay-border campaignbay-rounded-lg campaignbay-max-h-[50vh] campaignbay-mt-[12px]">
              <table className="campaignbay-min-w-full campaignbay-text-sm campaignbay-text-left campaignbay-text-gray-600">
                <thead className="campaignbay-bg-gray-50 campaignbay-text-xs campaignbay-text-gray-700 campaignbay-uppercase campaignbay-sticky campaignbay-top-0">
                  <tr>
                    {headers.map((header) => (
                      <th key={header} className="campaignbay-p-[10px]">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="campaignbay-bg-white">
                  {jsonData.map((row, rowIndex) => (
                    <tr
                      key={rowIndex}
                      className="campaignbay-border-b hover:campaignbay-bg-gray-50"
                    >
                      {headers.map((header) => (
                        <td
                          key={`${rowIndex}-${header}`}
                          className="campaignbay-p-[16px] campaignbay-whitespace-nowrap campaignbay-capitalize"
                        >
                          {String(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div
            className="campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-w-full"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label
              htmlFor="csv-importer"
              className={`campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-w-full campaignbay-h-64 campaignbay-border-2 campaignbay-border-dashed campaignbay-rounded-lg campaignbay-cursor-pointer campaignbay-transition-colors ${dropzoneClass}`}
            >
              <div className="campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-pt-5 campaignbay-pb-6">
                <Icon
                  icon={upload}
                  className="campaignbay-w-10 campaignbay-h-10 campaignbay-mb-3 campaignbay-text-gray-400"
                />
                <p className="campaignbay-mb-2 campaignbay-text-sm campaignbay-text-gray-500">
                  <span className="campaignbay-font-semibold">
                    {__("Click to upload", "campaignbay")}
                  </span>{" "}
                  {__("or drag and drop", "campaignbay")}
                </p>
                <p className="campaignbay-text-xs campaignbay-text-gray-500">
                  {__("CSV file (max. 2MB)", "campaignbay")}
                </p>
              </div>
              <input
                id="csv-importer"
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
            </label>
          </div>
        )}

        {error && (
          <div className="campaignbay-mt-4 campaignbay-p-3 campaignbay-text-sm campaignbay-text-red-700 campaignbay-bg-red-100 campaignbay-border campaignbay-border-red-200 campaignbay-rounded-md">
            <strong>{__("Error:", "campaignbay")}</strong> {error}
          </div>
        )}

        <div className="campaignbay-flex campaignbay-justify-end campaignbay-gap-4 campaignbay-mt-[24px]">
          <button
            className="campaignbay-text-blue-600 hover:campaignbay-bg-blue-100 campaignbay-p-8 campaignbay-rounded-sm"
            onClick={handleClose}
          >
            {__("Cancel", "campaignbay")}
          </button>
          <button
            className="campaignbay-bg-blue-600 hover:campaignbay-bg-blue-700 campaignbay-text-white campaignbay-p-8 campaignbay-rounded-sm campaignbay-transition-colors disabled:campaignbay-text-blue-400 "
            onClick={handleConfirmImport}
            disabled={!jsonData || error}
          >
            {__("Import Campaigns", "campaignbay")}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportModal;
