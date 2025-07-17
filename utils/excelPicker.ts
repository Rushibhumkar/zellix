import * as DocumentPicker from 'expo-document-picker';
// import convertXLSXtoJSON from './XLSXConverter';
import * as FileSystem from 'expo-file-system';
import * as XLSX from 'xlsx';


const convertXLSXtoJSON = async (filePath) => {
    try {
        // Read the XLSX file
        // const fileContent = await FileSystem.readAsStringAsync(filePath);
        const fileContent = await FileSystem.readAsStringAsync(filePath, { encoding: FileSystem.EncodingType.Base64 });
        // const workbook = XLSX.read(fileContent, { type: 'string' });
        const workbook = XLSX.read(fileContent, { type: "base64" });
        // Convert the first sheet to JSON
        const firstSheetName = workbook.SheetNames[0];
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

        return jsonData;
    } catch (error) {
        console.error('Error converting XLSX to JSON:', error);
        throw error;
    }
};


export const excelPicker = async () => {
    let res = [];
    try {
        const result = await DocumentPicker.getDocumentAsync({ type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        if (!result.canceled) {
            const filePath = result?.assets[0].uri;
            const data = await convertXLSXtoJSON(filePath);
            // setJsonData(data);
            res = data;
        }
    } catch (error) {
        console.error('Error picking document:', error);
    }
    return res.length > 0 ? res : null
};

