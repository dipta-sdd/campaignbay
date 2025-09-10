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
      result.push(currentVal);
      currentVal = "";
    } else {
      currentVal += char;
    }
  }
  result.push(currentVal); // Add the last value
  return result;
};

/**
 * Converts a CSV string into an array of JSON objects.
 *
 * @param {string} csvString The raw CSV content from the file.
 * @returns {Array<object>} An array of objects representing the rows.
 * @throws {Error} If the CSV is malformed (e.g., row length mismatch).
 */
export const csvToJson = (csvString) => {
  if (!csvString) {
    throw new Error("CSV string is empty or invalid.");
  }

  // Split the string into lines, filtering out empty lines.
  const lines = csvString
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");
  if (lines.length < 2) {
    throw new Error("CSV must have a header row and at least one data row.");
  }

  // The first line is the header.
  const headers = lines.shift().trim().split(",");

  const jsonArray = lines.map((line, index) => {
    const values = parseCsvRow(line.trim());

    // Validate that the number of values matches the number of headers.
    if (values.length !== headers.length) {
      throw new Error(
        `Row ${index + 2}: Column count mismatch. Expected ${
          headers.length
        }, but got ${values.length}.`
      );
    }

    // Use reduce to create an object from the headers and values.
    return headers.reduce((obj, header, i) => {
      obj[header] = values[i];
      return obj;
    }, {});
  });

  return jsonArray;
};
