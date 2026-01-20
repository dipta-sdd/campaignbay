/**
 * A robust CSV row parser that correctly handles quoted fields.
 * @param {string} rowString The string for a single CSV row.
 * @returns {string[]} An array of cell values.
 */
/**
 * A more robust CSV row parser that handles escaped double quotes.
 * @param {string} rowString The string for a single CSV row.
 * @returns {string[]} An array of cell values.
 */
const parseCsvRow = (rowString: string): string[] => {
  const result: string[] = [];
  let currentVal = "";
  let inQuotes = false;

  for (let i = 0; i < rowString.length; i++) {
    const char = rowString[i];

    if (char === '"') {
      // Check if this is an escaped quote ("")
      if (inQuotes && rowString[i + 1] === '"') {
        currentVal += '"'; // Add a literal quote
        i++; // Skip the next character
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(currentVal); // Don't trim here, let the outer logic do it
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal);

  // Trim quotes from start/end of each value after parsing
  return result.map((val) => {
    if (val.startsWith('"') && val.endsWith('"')) {
      return val.slice(1, -1).trim();
    }
    return val.trim();
  });
};

type JsonDataObject = Record<string, any>;

/**
 * Converts a CSV string into an array of JSON objects, optionally keeping only specified columns.
 *
 * @param {string} csvString The raw CSV content from the file.
 * @param {string[]} [columnsToKeep] - Optional. An array of header names to include in the final JSON.
 *                                     If not provided, all columns are included.
 * @returns {Array<object>} An array of objects representing the rows.
 * @throws {Error} If the CSV is malformed.
 */
export const csvToJson = (
  csvString: string,
  columnsToKeep: string[] = []
): JsonDataObject[] => {
  if (!csvString) {
    throw new Error("CSV string is empty or invalid.");
  }

  const lines = csvString
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row.");
  }

  const allHeaders = lines?.shift()?.trim().split(",");

  let headersToProcess: string[] = allHeaders || [];
  let headerIndices: number[] = allHeaders?.map((_, index) => index) || [];

  if (columnsToKeep && columnsToKeep.length > 0) {
    headersToProcess = [];
    headerIndices = [];

    columnsToKeep.forEach((columnName) => {
      const index = allHeaders?.indexOf(columnName);
      if (index !== undefined && index > -1) {
        headersToProcess.push(columnName);
        headerIndices.push(index);
      } else {
        console.warn(`Column "${columnName}" not found in CSV file.`);
      }
    });

    if (headersToProcess.length === 0) {
      throw new Error(
        "None of the specified columns to keep were found in the CSV header."
      );
    }
  }

  const jsonArray: JsonDataObject[] = lines.map((line, index) => {
    const values = parseCsvRow(line.trim());

    if (values.length !== allHeaders?.length) {
      throw new Error(
        `Row ${
          index + 2
        }: Column count mismatch. Expected ${allHeaders?.length}, but got ${
          values.length
        }.`
      );
    }

    return headersToProcess.reduce((obj: JsonDataObject, header, i) => {
      const originalIndex = headerIndices[i];
      obj[header] = values[originalIndex];
      return obj;
    }, {});
  });
  return jsonArray;
};
