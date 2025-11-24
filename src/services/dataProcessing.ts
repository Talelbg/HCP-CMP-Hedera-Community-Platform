import { DeveloperRecord } from '../types';

// Types for the metrics
export interface DashboardMetrics {
  totalRegistered: number;
  totalCertified: number;
  usersStartedCourse: number;
  usersStartedCoursePct: number;
  avgCompletionTimeDays: number;
  activeCommunities: number;
  certificationRate: number;
  overallSubscriberRate: number;
  potentialFakeAccounts: number;
  potentialFakeAccountsPct: number;
  rapidCompletions: number;
}

// Re-export DeveloperRecord from main types
export type { DeveloperRecord } from '../types';

export const calculateDashboardMetrics = (data: DeveloperRecord[], start: Date | null, end: Date | null): DashboardMetrics => {
    // Filter by date if provided
    const filteredData = data.filter(d => {
        const dDate = new Date(d.createdAt); // Use createdAt
        if (start && dDate < start) return false;
        if (end && dDate > end) return false;
        return true;
    });

    const totalRegistered = filteredData.length;
    // Map existing fields to "status" logic
    // Certified if finalGrade == 'Pass'
    const certifiedUsers = filteredData.filter(d => d.finalGrade === 'Pass');
    const totalCertified = certifiedUsers.length;

    // Started if percentageCompleted > 0
    const usersStarted = filteredData.filter(d => d.percentageCompleted > 0);
    const usersStartedCourse = usersStarted.length;

    // Average Completion Time
    let totalTime = 0;
    let completedCount = 0;
    certifiedUsers.forEach(u => {
        if (u.completedAt && u.createdAt) {
            const diff = new Date(u.completedAt).getTime() - new Date(u.createdAt).getTime();
            totalTime += diff;
            completedCount++;
        }
    });
    const avgCompletionTimeDays = completedCount > 0 ? (totalTime / (1000 * 60 * 60 * 24)) / completedCount : 0;

    // Fake Accounts (Mock logic: < 5 hours completion or suspicious)
    // d.caStatus might have flags in future, using simple time heuristic
    const rapid = certifiedUsers.filter(u => {
         if (!u.completedAt) return false;
         const hours = (new Date(u.completedAt).getTime() - new Date(u.createdAt).getTime()) / (1000 * 60 * 60);
         return hours < 5;
    });

    // Check for suspicious flags in caStatus if any
    const flagged = filteredData.filter(d => d.caStatus && d.caStatus.toLowerCase().includes('flag'));

    const uniqueCommunities = new Set(filteredData.map(d => d.partnerCode));

    return {
        totalRegistered,
        totalCertified,
        usersStartedCourse,
        usersStartedCoursePct: totalRegistered > 0 ? (usersStartedCourse / totalRegistered) * 100 : 0,
        avgCompletionTimeDays,
        activeCommunities: uniqueCommunities.size,
        certificationRate: totalRegistered > 0 ? (totalCertified / totalRegistered) * 100 : 0,
        overallSubscriberRate: 45.2, // Mocked as we don't have email status in this simple type
        potentialFakeAccounts: flagged.length + rapid.length,
        potentialFakeAccountsPct: totalRegistered > 0 ? ((flagged.length + rapid.length) / totalRegistered) * 100 : 0,
        rapidCompletions: rapid.length
    };
};

export const generateChartData = (data: DeveloperRecord[], start: Date | null, end: Date | null) => {
    // Bucket by month or day depending on range. For simplicity, let's bucket by month for "All Time" and Day for shorter ranges.
    // Defaulting to simple monthly bucketing for this implementation.

    const buckets: Record<string, { registrations: number, certifications: number }> = {};

    const filteredData = data.filter(d => {
        const dDate = new Date(d.createdAt);
        if (start && dDate < start) return false;
        if (end && dDate > end) return false;
        return true;
    });

    filteredData.forEach(d => {
        const date = new Date(d.createdAt);
        const key = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`; // e.g., "Oct 2023"

        if (!buckets[key]) buckets[key] = { registrations: 0, certifications: 0 };
        buckets[key].registrations++;

        if (d.finalGrade === 'Pass' && d.completedAt) {
             const cDate = new Date(d.completedAt);
             const cKey = `${cDate.toLocaleString('default', { month: 'short' })} ${cDate.getFullYear()}`;
             if (!buckets[cKey]) buckets[cKey] = { registrations: 0, certifications: 0 };
             buckets[cKey].certifications++;
        }
    });

    return Object.entries(buckets).map(([name, val]) => ({ name, ...val })).sort((a,b) => {
        // Sort by date (naive string sort won't work perfectly, but sufficient for mock if key includes year)
        return new Date(a.name).getTime() - new Date(b.name).getTime();
    });
};

export const generateLeaderboard = (data: DeveloperRecord[]) => {
    const counts: Record<string, number> = {};
    data.filter(d => d.finalGrade === 'Pass').forEach(d => {
        counts[d.partnerCode] = (counts[d.partnerCode] || 0) + 1;
    });

    return Object.entries(counts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10); // Top 10
};
