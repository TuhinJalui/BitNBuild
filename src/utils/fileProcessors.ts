import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import mammoth from 'mammoth';
import { FileAttachment } from '../types';

export const processFile = async (file: File): Promise<FileAttachment> => {
  const attachment: FileAttachment = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    size: file.size,
  };

  try {
    if (file.type.includes('text/plain')) {
      attachment.content = await readTextFile(file);
    } else if (file.type.includes('application/pdf')) {
      attachment.content = await processPDF(file);
    } else if (file.type.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      attachment.content = await processDocx(file);
    } else if (file.type.includes('application/vnd.ms-excel') || file.type.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      attachment.data = await processExcel(file);
      attachment.content = JSON.stringify(attachment.data, null, 2);
    } else if (file.type.includes('text/csv')) {
      attachment.data = await processCSV(file);
      attachment.content = JSON.stringify(attachment.data, null, 2);
    } else if (file.type.includes('image/')) {
      attachment.url = await createImageURL(file);
      attachment.content = `Image file: ${file.name}`;
    } else {
      attachment.content = `Unsupported file type: ${file.type}`;
    }
  } catch (error) {
    console.error('Error processing file:', error);
    attachment.content = `Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return attachment;
};

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const processPDF = async (file: File): Promise<string> => {
  try {
    // For now, return a placeholder. In a real app, you'd use pdf-parse or similar
    return `PDF file processed: ${file.name}\nContent extraction would require a PDF parsing library.`;
  } catch (error) {
    throw new Error(`Failed to process PDF: ${error}`);
  }
};

const processDocx = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    throw new Error(`Failed to process DOCX: ${error}`);
  }
};

const processExcel = async (file: File): Promise<any> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } catch (error) {
    throw new Error(`Failed to process Excel: ${error}`);
  }
};

const processCSV = async (file: File): Promise<any> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => resolve(results.data),
      error: reject,
    });
  });
};

const createImageURL = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    resolve(url);
  });
};

export const extractTaxData = (content: string, fileName: string): any => {
  const data: any = {
    fileName,
    extractedAt: new Date().toISOString(),
    type: 'unknown',
    data: {}
  };

  // Simple pattern matching for common tax documents
  const patterns = {
    w2: /wages.*tips.*compensation|employer.*identification|federal.*income.*tax.*withheld/i,
    '1099': /payer|recipient|federal.*income.*tax.*withheld|nonemployee.*compensation/i,
    receipt: /receipt|total|amount|date|vendor|merchant/i,
    bankStatement: /account.*number|balance|transaction|deposit|withdrawal/i,
  };

  // Determine document type
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(content)) {
      data.type = type;
      break;
    }
  }

  // Extract numerical values
  const amounts = content.match(/\$?[\d,]+\.?\d*/g) || [];
  data.data.amounts = amounts.map(amount => parseFloat(amount.replace(/[$,]/g, '')));

  // Extract dates
  const dates = content.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}-\d{1,2}-\d{2,4}/g) || [];
  data.data.dates = dates;

  return data;
};