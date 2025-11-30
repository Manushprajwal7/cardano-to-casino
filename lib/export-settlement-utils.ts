// Utility functions for exporting settlement receipts

/**
 * Export settlement data as PDF receipt
 * @param settlementData - The settlement data to export
 */
export function exportSettlementReceipt(settlementData: any) {
  try {
    // Create a simple text-based receipt
    const receiptContent = `
CARDANO CASINO PLATFORM
SETTLEMENT RECEIPT
=====================

Settlement ID: ${settlementData.settlementId || "N/A"}
Session ID: ${settlementData.sessionId || "N/A"}
Total Amount: ${settlementData.amount?.toFixed(2) || "0.00"} ADA
Platform Fee: ${settlementData.fee?.toFixed(2) || "0.00"} ADA
Operator Payout: ${
      (settlementData.amount - settlementData.fee)?.toFixed(2) || "0.00"
    } ADA
Transaction Hash: ${settlementData.txHash || "N/A"}
Status: ${settlementData.status || "N/A"}
Processed At: ${
      settlementData.timestamp
        ? new Date(settlementData.timestamp).toLocaleString()
        : "N/A"
    }

Generated on: ${new Date().toLocaleString()}
=====================
This is an automated receipt for settlement on the Cardano Casino Platform.
`;

    // Create blob and download as text file
    const blob = new Blob([receiptContent], {
      type: "text/plain;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `settlement-receipt-${settlementData.settlementId || "unknown"}.txt`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error: any) {
    console.error("Error exporting settlement receipt:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Export multiple settlements as CSV
 * @param settlements - Array of settlement data
 */
export function exportSettlementsCSV(settlements: any[]) {
  try {
    // Create CSV header
    const headers = [
      "Settlement ID",
      "Session ID",
      "Amount (ADA)",
      "Fee (ADA)",
      "Payout (ADA)",
      "Tx Hash",
      "Status",
      "Timestamp",
    ];

    // Create CSV rows
    const rows = settlements.map((settlement) => [
      settlement.id || settlement.settlementId || "",
      settlement.sessionId || "",
      settlement.amount?.toFixed(2) || "0.00",
      settlement.fee?.toFixed(2) || "0.00",
      (settlement.amount - settlement.fee)?.toFixed(2) || "0.00",
      settlement.txHash || "",
      settlement.status || "",
      settlement.timestamp ? new Date(settlement.timestamp).toISOString() : "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `settlements-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return { success: true };
  } catch (error: any) {
    console.error("Error exporting settlements CSV:", error);
    return { success: false, error: error.message };
  }
}
