import * as DocumentPicker from "expo-document-picker";
// import convertXLSXtoJSON from './XLSXConverter';
import * as FileSystem from "expo-file-system/legacy";
import * as XLSX from "xlsx";

const convertXLSXtoJSON = async (filePath) => {
  try {
    // Read the XLSX file
    // const fileContent = await FileSystem.readAsStringAsync(filePath);
    const fileContent = await FileSystem.readAsStringAsync(filePath, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // const workbook = XLSX.read(fileContent, { type: 'string' });
    const workbook = XLSX.read(fileContent, { type: "base64" });
    // Convert the first sheet to JSON
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];
    const matrix = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: "", blankrows: true });
    const headerRow = matrix[0] || [];
    const width = matrix.reduce((max, row) => Math.max(max, row.length), 0);
    const origin = XLSX.utils.decode_range(sheet["!ref"] || "A1").s;
    const seen = new Set<string>();
    const columns = Array.from({ length: width }, (_, index) => {
      // Ignore columns containing neither a header nor any data.
      if (!matrix.some((row) => String(row[index] ?? "").trim())) return null;
      const letter = XLSX.utils.encode_col(origin.c + index);
      const base = String(headerRow[index] ?? "").trim() || `Column ${letter} (no header)`;
      let label = base;
      let suffix = 1;
      while (seen.has(label.toLowerCase()) || label === "__rowNum__") {
        label = `${base} (Column ${letter}${suffix > 1 ? `, ${suffix}` : ""})`;
        suffix += 1;
      }
      seen.add(label.toLowerCase());
      return { index, label };
    }).filter((column): column is { index: number; label: string } => column !== null);
    const jsonData = matrix.slice(1).map((row, index) => {
      const record = Object.fromEntries(columns.map((column) => [column.label, row[column.index] ?? ""]));
      Object.defineProperty(record, "__rowNum__", { value: origin.r + index + 1 });
      return record;
    }).filter((row) => Object.values(row).some((value) => String(value).trim()));
    return jsonData;
  } catch (error) {
    console.error("Error converting XLSX to JSON:", error);
    throw error;
  }
};

export const excelPicker = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
      ],
    });
    if (result.canceled) return null;
    const filePath = result.assets?.[0]?.uri;
    if (!filePath) throw new Error("Selected file could not be opened");
    return {
      rows: await convertXLSXtoJSON(filePath),
      fileName: result.assets[0].name,
    };
  } catch (error) {
    console.error("Error picking document:", error);
    throw error;
  }
};
