import { DeveloperRecord } from '../types';

// Configuration constants for fraud detection
const MS_PER_HOUR = 3600000;
const THRESHOLDS = {
  BOT_HOURS: 0.5,      // < 30 minutes
  SPEED_RUN_HOURS: 4,  // < 4 hours  
  RAPID_HOURS: 5,      // < 5 hours
};
const RISK_SCORES = {
  EMAIL_ALIAS: 15,
  DISPOSABLE_EMAIL: 40,
  BOT_ACTIVITY: 60,
  SPEED_RUN: 30,
  RAPID_COMPLETION: 15,
  CA_FLAGGED: 25,
  SYBIL: 35,
};

// Known disposable email domains (extend as needed)
const DISPOSABLE_DOMAINS = ['yopmail.com', 'tempmail.com', 'guerrillamail.com', 'mailinator.com', '10minutemail.com'];

export interface FraudCheckResult {
  isSuspicious: boolean;
  suspicionReason: string;
  riskScore: number;
}

// Check completion time in hours
const getHours = (start: string, end: string | null): number | null => {
  if (!end) return null;
  return (new Date(end).getTime() - new Date(start).getTime()) / MS_PER_HOUR;
};

// Perform fraud check on a single record
export const performFraudCheck = (record: Omit<DeveloperRecord, 'id'>): FraudCheckResult => {
  const flags: string[] = [];
  let score = 0;

  // Email checks
  if (record.email.includes('+')) { flags.push('Email alias'); score += RISK_SCORES.EMAIL_ALIAS; }
  const domain = record.email.split('@')[1]?.toLowerCase();
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) { flags.push('Disposable email'); score += RISK_SCORES.DISPOSABLE_EMAIL; }

  // Speed checks
  const hours = getHours(record.createdAt, record.completedAt);
  if (hours !== null) {
    if (hours < THRESHOLDS.BOT_HOURS) { flags.push('Bot activity (<30min)'); score += RISK_SCORES.BOT_ACTIVITY; }
    else if (hours < THRESHOLDS.SPEED_RUN_HOURS) { flags.push('Speed run (<4h)'); score += RISK_SCORES.SPEED_RUN; }
    else if (hours < THRESHOLDS.RAPID_HOURS) { flags.push('Rapid completion'); score += RISK_SCORES.RAPID_COMPLETION; }
  }

  // CA Status flag
  if (record.caStatus?.toLowerCase().includes('flag')) { flags.push('CA flagged'); score += RISK_SCORES.CA_FLAGGED; }

  return {
    isSuspicious: flags.length > 0,
    suspicionReason: flags.join('; '),
    riskScore: Math.min(score, 100),
  };
};

// Detect Sybil accounts (same wallet)
export const detectSybilAccounts = (records: Omit<DeveloperRecord, 'id'>[]): Map<string, number> => {
  const wallets = new Map<string, number>();
  records.forEach(r => {
    const w = r.walletAddress?.trim().toLowerCase();
    if (w) wallets.set(w, (wallets.get(w) || 0) + 1);
  });
  // Return only duplicates
  const result = new Map<string, number>();
  wallets.forEach((count, wallet) => { if (count > 1) result.set(wallet, count); });
  return result;
};

// Enrich records with fraud detection
export const enrichRecordsWithFraudDetection = (
  records: Omit<DeveloperRecord, 'id'>[]
): Omit<DeveloperRecord, 'id'>[] => {
  const sybils = detectSybilAccounts(records);
  
  return records.map(record => {
    const result = performFraudCheck(record);
    const wallet = record.walletAddress?.trim().toLowerCase();
    const sybilCount = wallet ? sybils.get(wallet) : undefined;
    
    if (sybilCount && sybilCount > 1) {
      result.isSuspicious = true;
      result.riskScore = Math.min(result.riskScore + RISK_SCORES.SYBIL, 100);
      result.suspicionReason = result.suspicionReason 
        ? `${result.suspicionReason}; Sybil (${sybilCount} accounts)` 
        : `Sybil (${sybilCount} accounts)`;
    }

    return { ...record, ...result };
  });
};

export const fraudDetectionService = { performFraudCheck, detectSybilAccounts, enrichRecordsWithFraudDetection };
export default fraudDetectionService;
