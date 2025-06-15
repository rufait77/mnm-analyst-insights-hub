
export type CsvIssue = {
  message: string;
  suggestions?: string[];
};

export function analyzeCsvIssues(headers: string[], rows: string[][]): CsvIssue[] {
  const issues: CsvIssue[] = [];
  // Check for empty cells
  const missingRows: { row: number; columns: string[] }[] = [];
  rows.forEach((row, i) => {
    const missingCols: string[] = [];
    headers.forEach((h, j) => {
      if (!row[j] || row[j].trim() === "") {
        missingCols.push(h);
      }
    });
    if (missingCols.length) missingRows.push({ row: i + 1, columns: missingCols });
  });
  if (missingRows.length) {
    issues.push({
      message: `There are ${missingRows.length} row(s) with missing values.`,
      suggestions: [
        ...missingRows.slice(0, 3).map(
          r =>
            `Row ${r.row + 1}: missing [${r.columns.join(", ")}]`
        ),
        ...(missingRows.length > 3 ? ["...more rows."] : []),
        "Fill in the missing cells or consider removing incomplete rows."
      ],
    });
  }

  // Check for duplicate rows (ignore header)
  const rowStrs = rows.map(r => JSON.stringify(r));
  const dupMap = rowStrs.reduce((acc: Record<string, number[]>, s, i) => {
    acc[s] = acc[s] || [];
    acc[s].push(i + 1);
    return acc;
  }, {});
  const dups = Object.values(dupMap).filter(arr => arr.length > 1);
  if (dups.length) {
    issues.push({
      message: "Duplicate rows detected.",
      suggestions: [
        ...dups.slice(0, 2).map(
          d => `Rows ${d.join(", ")} appear identical`
        ),
        ...(dups.length > 2 ? ["...more duplicates."] : []),
        "Consider removing duplicate entries."
      ],
    });
  }

  // Check if all rows have same length as headers (data misalignment)
  const misaligned = rows
    .map((row, i) => (row.length !== headers.length ? i + 1 : null))
    .filter(Boolean) as number[];
  if (misaligned.length) {
    issues.push({
      message: "Some rows have a different number of columns.",
      suggestions: [
        ...misaligned.slice(0, 3).map(r => `Row ${r}`),
        ...(misaligned.length > 3 ? ["...more rows."] : []),
        "Review the CSV for misaligned semicolons or commas."
      ],
    });
  }

  // Could add type checks and more guidance here later

  if (!issues.length) {
    issues.push({ message: "No major issues detected!", suggestions: ["Your data looks good."] });
  }
  return issues;
}
