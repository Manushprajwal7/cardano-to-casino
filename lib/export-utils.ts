// Utility functions for exporting data

export interface ExportData {
  [key: string]: any;
}

export type ExportFormat = "csv" | "json" | "xlsx";

/**
 * Convert array of objects to CSV format
 */
export function arrayToCSV(data: ExportData[]): string {
  if (!data || data.length === 0) return "";

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Add header row
  csvRows.push(headers.join(","));

  // Add data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      // Escape commas and wrap in quotes if needed
      if (typeof value === "string" && value.includes(",")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
}

/**
 * Convert array of objects to JSON format
 */
export function arrayToJSON(data: ExportData[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Download data as a file
 */
export function downloadFile(
  data: string,
  filename: string,
  mimeType: string
): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export data in specified format
 */
export function exportData(
  data: ExportData[],
  format: ExportFormat,
  filename: string
): void {
  let content: string;
  let mimeType: string;
  let fileExtension: string;

  switch (format) {
    case "csv":
      content = arrayToCSV(data);
      mimeType = "text/csv";
      fileExtension = "csv";
      break;
    case "json":
      content = arrayToJSON(data);
      mimeType = "application/json";
      fileExtension = "json";
      break;
    default:
      throw new Error(`Unsupported export format: ${format}`);
  }

  const fullFilename = filename.endsWith(`.${fileExtension}`)
    ? filename
    : `${filename}.${fileExtension}`;

  downloadFile(content, fullFilename, mimeType);
}

/**
 * Export settlement data
 */
export function exportSettlements(settlements: any[]): void {
  exportData(settlements, "csv", "settlements-export");
}

/**
 * Export session data
 */
export function exportSessions(sessions: any[]): void {
  exportData(sessions, "csv", "sessions-export");
}

/**
 * Export audit data
 */
export function exportAuditData(auditData: any[]): void {
  exportData(auditData, "csv", "audit-export");
}
