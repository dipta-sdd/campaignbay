import { useState, useCallback, FC } from "react";
import { Icon, upload } from "@wordpress/icons";
import { csvToJson } from "./csvToJson";
import { __ } from "@wordpress/i18n";
import CustomModal from "../common/CustomModal";

type JsonDataRow = Record<string, string | number | boolean>;
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: JsonDataRow[]) => void;
}

/**
 * A modal for importing campaigns from a CSV file with drag-and-drop support.
 *
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open.
 * @param {Function} props.onClose - Function to call when the modal should close.
 * @param {Function} props.onImport - Function to call with the parsed JSON data when the user confirms the import.
 */
const ImportModal: FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [jsonData, setJsonData] = useState<JsonDataRow[] | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  /**
   * A centralized function to process a single file object.
   * @param {File} file
   */
  const processFile = useCallback((file: File) => {
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
    reader.onload = (e: ProgressEvent<FileReader>) => {
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

        const parsedData = csvToJson(
          e?.target?.result as string,
          requiredColumns
        );
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
      } catch (err: any) {
        setError(err?.message);
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
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      processFile(event.target.files[0]);
    }
  };

  /**
   * Handles the drag over event to allow dropping.
   */
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(true);
    },
    []
  );

  /**
   * Handles the drag leave event to reset visual state.
   */
  const handleDragLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDraggingOver(false);
    },
    []
  );

  /**
   * Handles the file drop event.
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
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
      // Safely parse nested JSON strings within the data
      const processedData = jsonData.map((item) => {
        const safeParse = (jsonString: any) => {
          try {
            return typeof jsonString === "string"
              ? JSON.parse(jsonString)
              : jsonString;
          } catch {
            return Array.isArray(jsonString) ? [] : {};
          }
        };
        return {
          ...item,
          tiers: safeParse(item.tiers),
          conditions: safeParse(item.conditions),
          settings: safeParse(item.settings),
        };
      });
      onImport(processedData);
    }
  };

  const handleClose = () => {
    setJsonData(null);
    setHeaders([]);
    setFileName("");
    setError(null);
    onClose();
  };

  const dropzoneClass = isDraggingOver
    ? "campaignbay-border-blue-500 campaignbay-bg-blue-50"
    : "campaignbay-border-gray-300 campaignbay-bg-gray-50 hover:campaignbay-bg-gray-100";

  return (
    <CustomModal
      maxWidth="campaignbay-max-w-4xl"
      title={__("Import Campaigns from CSV", "campaignbay")}
      isOpen={isOpen}
      onClose={handleClose}
      footer={
        <>
          <button
            className="campaignbay-text-blue-600 hover:campaignbay-bg-blue-100 campaignbay-p-[8px] campaignbay-rounded-sm"
            onClick={handleClose}
          >
            {__("Cancel", "campaignbay")}
          </button>
          <button
            className="campaignbay-bg-blue-600 hover:campaignbay-bg-blue-700 campaignbay-text-white campaignbay-p-[8px] campaignbay-rounded-sm campaignbay-transition-colors disabled:campaignbay-text-blue-400 disabled:campaignbay-bg-gray-200"
            onClick={handleConfirmImport}
            disabled={!jsonData || !!error}
          >
            {__("Import Campaigns", "campaignbay")}
          </button>
        </>
      }
    >
      <div className="campaignbay-p-[2px]">
        {jsonData ? (
          <div>
            <div className="campaignbay-flex campaignbay-items-center campaignbay-justify-between campaignbay-mb-[4px]">
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
              <div className="campaignbay-flex campaignbay-flex-col campaignbay-items-center campaignbay-justify-center campaignbay-pt-5 campaignbay-pb-[6px]">
                <Icon
                  icon={upload}
                  className="campaignbay-w-10 campaignbay-h-10 campaignbay-mb-3 campaignbay-text-gray-400"
                />
                <p className="campaignbay-mb-[2px] campaignbay-text-sm campaignbay-text-gray-500">
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
          <div className="campaignbay-mt-[4px] campaignbay-p-3 campaignbay-text-sm campaignbay-text-red-700 campaignbay-bg-red-100 campaignbay-border campaignbay-border-red-200 campaignbay-rounded-md">
            <strong>{__("Error:", "campaignbay")}</strong> {error}
          </div>
        )}
      </div>
    </CustomModal>
  );
};

export default ImportModal;
