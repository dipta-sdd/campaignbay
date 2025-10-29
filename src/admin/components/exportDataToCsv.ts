type DataObject = Record<string, any>;

const escapeCsvCell = (value: unknown) => {
  // If the value is null or undefined, return an empty string.
  if (value == null) {
    return "";
  }
  if (typeof value === "object") {
    try {
      value = JSON.stringify(value);
    } catch {
      value = "[unserializable object]";
    }
  }
  const stringValue = String(value);

  // If the string contains a comma, a double quote, or a newline,
  // it must be enclosed in double quotes.
  if (
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n")
  ) {
    // Any double quote characters inside the string must be escaped by doubling them.
    const escapedString = stringValue.replace(/"/g, '""');
    return `"${escapedString}"`;
  }

  return stringValue;
};

/**
 * Converts an array of campaign objects to a CSV string and triggers a download.
 * @param {Array<object>} campaigns The array of campaign data from the API.
 * @param {string} filename The desired filename for the download (e.g., 'campaigns.csv').
 */
export const exportDataToCsv = (
  campaigns: DataObject[],
  filename = "campaigns-export.csv"
) => {
  if (!campaigns || campaigns.length === 0) {
    console.error("No data to export.");
    return;
  }

  // 1. Define the headers from the first campaign object.
  const headers = Object.keys(campaigns[0]);

  // 2. Create the header row of the CSV.
  const csvHeader = headers.join(",") + "\n";

  // 3. Create the data rows.
  const csvRows = campaigns
    .map((row) => {
      // Map over the headers to ensure the values are in the correct order.
      return headers
        .map((header) => {
          // The value for the current header in the current row.
          const value = row[header];
          // Escape each cell to handle special characters correctly.
          return escapeCsvCell(value);
        })
        .join(",");
    })
    .join("\n");

  // 4. Combine header and rows.
  const csvString = csvHeader + csvRows;

  // 5. Trigger the download in the browser.
  // Create a "Blob" (Binary Large Object) from our CSV string.
  const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });

  // Create a temporary link element.
  const link = document.createElement("a");
  if (link.download !== undefined) {
    // Check for browser support.
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the object URL.
  }
};
