import Papa from 'papaparse';
import { DeveloperRecord } from '../types';

export interface CsvImportResult {
  validRecords: Omit<DeveloperRecord, 'id'>[];
  errors: string[];
}

const REQUIRED_HEADERS = [
  "Email", "First Name", "Last Name", "Phone Number", "Country",
  "Accepted Membership", "Accepted Marketing", "Wallet Address",
  "Partner Code", "Percentage Completed", "Created At",
  "Completed At", "Final Score", "Final Grade", "CA Status"
];

const mapCsvRowToRecord = (row: any): Omit<DeveloperRecord, 'id'> => {
  return {
    email: row['Email'] || '',
    firstName: row['First Name'] || '',
    lastName: row['Last Name'] || '',
    phone: row['Phone Number'] || '',
    country: row['Country'] || '',
    acceptedMembership: String(row['Accepted Membership']).toLowerCase() === 'true' || row['Accepted Membership'] === '1',
    acceptedMarketing: String(row['Accepted Marketing']).toLowerCase() === 'true' || row['Accepted Marketing'] === '1',
    walletAddress: row['Wallet Address'] || '',
    partnerCode: row['Partner Code'] || 'UNKNOWN',
    percentageCompleted: Number(row['Percentage Completed']) || 0,
    createdAt: row['Created At'] || new Date().toISOString(),
    completedAt: row['Completed At'] || null,
    finalScore: Number(row['Final Score']) || 0,
    finalGrade: (row['Final Grade'] as any) || 'Pending',
    caStatus: row['CA Status'] || '',
  };
};

export const csvService = {
  parseCsv: (file: File): Promise<CsvImportResult> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const headers = results.meta.fields || [];
          const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));

          if (missingHeaders.length > 0) {
            resolve({
              validRecords: [],
              errors: [`Missing required columns: ${missingHeaders.join(', ')}`]
            });
            return;
          }

          const validRecords: Omit<DeveloperRecord, 'id'>[] = [];
          const errors: string[] = [];

          results.data.forEach((row: any, index) => {
             // Basic validation
             if (!row['Email']) {
                 errors.push(`Row ${index + 2}: Missing Email`);
                 return;
             }

             try {
                 const record = mapCsvRowToRecord(row);
                 validRecords.push(record);
             } catch (e) {
                 errors.push(`Row ${index + 2}: Error parsing data`);
             }
          });

          resolve({ validRecords, errors });
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  }
};
