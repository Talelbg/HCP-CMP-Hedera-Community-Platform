import Papa from 'papaparse';
import { DeveloperRecord } from '../types';

export interface CsvImportResult {
  validRecords: Omit<DeveloperRecord, 'id'>[];
  errors: string[];
}

// Normalize header for matching: lowercase, trim, collapse spaces
export const normalizeHeader = (header: string): string => {
  return header.toLowerCase().trim().replace(/\s+/g, ' ');
};

// Required headers with their normalized forms for matching
const REQUIRED_HEADERS_CORE = [
  "Email", "First Name", "Last Name", "Phone Number", "Country",
  "Accepted Membership", "Accepted Marketing", "Wallet Address",
  "Percentage Completed", "Created At",
  "Completed At", "Final Score", "Final Grade", "CA Status"
];

// Find a header in CSV headers using case-insensitive matching
export const findHeader = (headers: string[], targetHeader: string): string | undefined => {
  const normalizedTarget = normalizeHeader(targetHeader);
  return headers.find(h => normalizeHeader(h) === normalizedTarget);
};

// Check if a header exists in CSV headers using case-insensitive matching
export const hasHeader = (headers: string[], targetHeader: string): boolean => {
  return findHeader(headers, targetHeader) !== undefined;
};

// Helper to check for Partner Code logic (case-insensitive)
export const hasPartnerCodeColumns = (headers: string[]) => {
    if (hasHeader(headers, "Partner Code")) return true;
    if (hasHeader(headers, "Code") && hasHeader(headers, "Partner")) return true;
    return false;
};

// Get value from row using case-insensitive header matching
export const getRowValue = (row: any, headers: string[], targetHeader: string): any => {
  const actualHeader = findHeader(headers, targetHeader);
  return actualHeader ? row[actualHeader] : undefined;
};

const mapCsvRowToRecord = (row: any, headers: string[]): Omit<DeveloperRecord, 'id'> => {
  // Logic to resolve partner code (case-insensitive)
  let partnerCode = 'UNKNOWN';
  const partnerCodeValue = getRowValue(row, headers, 'Partner Code');
  const codeValue = getRowValue(row, headers, 'Code');
  
  if (partnerCodeValue) {
      partnerCode = partnerCodeValue;
  } else if (codeValue) {
      partnerCode = codeValue;
  }

  const acceptedMembershipValue = getRowValue(row, headers, 'Accepted Membership');
  const acceptedMarketingValue = getRowValue(row, headers, 'Accepted Marketing');

  return {
    email: getRowValue(row, headers, 'Email') || '',
    firstName: getRowValue(row, headers, 'First Name') || '',
    lastName: getRowValue(row, headers, 'Last Name') || '',
    phone: getRowValue(row, headers, 'Phone Number') || '',
    country: getRowValue(row, headers, 'Country') || '',
    acceptedMembership: String(acceptedMembershipValue).toLowerCase() === 'true' || acceptedMembershipValue === '1',
    acceptedMarketing: String(acceptedMarketingValue).toLowerCase() === 'true' || acceptedMarketingValue === '1',
    walletAddress: getRowValue(row, headers, 'Wallet Address') || '',
    partnerCode: partnerCode,
    percentageCompleted: Number(getRowValue(row, headers, 'Percentage Completed')) || 0,
    createdAt: getRowValue(row, headers, 'Created At') || new Date().toISOString(),
    completedAt: getRowValue(row, headers, 'Completed At') || null,
    finalScore: Number(getRowValue(row, headers, 'Final Score')) || 0,
    finalGrade: (getRowValue(row, headers, 'Final Grade') as any) || 'Pending',
    caStatus: getRowValue(row, headers, 'CA Status') || '',
  };
};

// Process parsed CSV data into CsvImportResult
const processParsedData = (results: Papa.ParseResult<any>): CsvImportResult => {
  const headers = results.meta.fields || [];

  // Check Core Headers (case-insensitive)
  const missingHeaders = REQUIRED_HEADERS_CORE.filter(h => !hasHeader(headers, h));

  // Check Partner/Code logic (case-insensitive)
  if (!hasPartnerCodeColumns(headers)) {
      missingHeaders.push("Partner Code (or 'Partner' and 'Code' columns)");
  }

  if (missingHeaders.length > 0) {
    return {
      validRecords: [],
      errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
    };
  }

  const validRecords: Omit<DeveloperRecord, 'id'>[] = [];
  const errors: string[] = [];

  results.data.forEach((row: any, index) => {
     // Basic validation (case-insensitive)
     const emailValue = getRowValue(row, headers, 'Email');
     if (!emailValue) {
         errors.push(`Row ${index + 2}: Missing Email`);
         return;
     }

     try {
         const record = mapCsvRowToRecord(row, headers);
         validRecords.push(record);
     } catch (e) {
         errors.push(`Row ${index + 2}: Error parsing data`);
     }
  });

  return { validRecords, errors };
};

export const csvService = {
  parseCsv: (file: File): Promise<CsvImportResult> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          resolve(processParsedData(results));
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  },

  /**
   * Parses a CSV string directly (useful for testing).
   */
  parseString: (csvString: string): CsvImportResult => {
    const results = Papa.parse(csvString, { header: true, skipEmptyLines: true });
    return processParsedData(results);
  }
};
