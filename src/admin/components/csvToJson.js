/**
 * A robust CSV row parser that correctly handles quoted fields.
 * @param {string} rowString The string for a single CSV row.
 * @returns {string[]} An array of cell values.
 */
const parseCsvRow = (rowString) => {
  const result = [];
  let currentVal = "";
  let inQuotes = false;
  for (const char of rowString) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(currentVal.trim());
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal.trim()); // Add the last value
  return result;
};

/**
 * Converts a CSV string into an array of JSON objects, optionally keeping only specified columns.
 *
 * @param {string} csvString The raw CSV content from the file.
 * @param {string[]} [columnsToKeep] - Optional. An array of header names to include in the final JSON.
 *                                     If not provided, all columns are included.
 * @returns {Array<object>} An array of objects representing the rows.
 * @throws {Error} If the CSV is malformed.
 */
export const csvToJson = (csvString, columnsToKeep = []) => {
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

  const allHeaders = lines.shift().trim().split(",");

  // --- NEW LOGIC: Determine which headers and indices to use ---
  let headersToProcess = allHeaders;
  let headerIndices = allHeaders.map((_, index) => index); // By default, use all indices

  if (columnsToKeep && columnsToKeep.length > 0) {
    headersToProcess = [];
    headerIndices = [];

    columnsToKeep.forEach((columnName) => {
      const index = allHeaders.indexOf(columnName);
      if (index > -1) {
        headersToProcess.push(columnName);
        headerIndices.push(index);
      } else {
        // Optional: You could throw an error if a required column is missing.
        console.warn(`Column "${columnName}" not found in CSV file.`);
      }
    });

    if (headersToProcess.length === 0) {
      throw new Error(
        "None of the specified columns to keep were found in the CSV header."
      );
    }
  }
  // --- END OF NEW LOGIC ---

  const jsonArray = lines.map((line, index) => {
    const values = parseCsvRow(line.trim());

    if (values.length !== allHeaders.length) {
      throw new Error(
        `Row ${index + 2}: Column count mismatch. Expected ${
          allHeaders.length
        }, but got ${values.length}.`
      );
    }

    // Use reduce to build the object, but only with the headers we decided to process.
    return headersToProcess.reduce((obj, header, i) => {
      const originalIndex = headerIndices[i];
      obj[header] = values[originalIndex];
      return obj;
    }, {});
  });

  return jsonArray;
};
