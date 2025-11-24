import { DeveloperRecord, UserRole, AdminUser } from './src/types';

export const CURRENT_USER_ROLE = UserRole.SUPER_ADMIN;

// Robust Mock Data Generation
export const GENERATE_MOCK_DEVELOPERS = (): DeveloperRecord[] => {
    return Array.from({ length: 50 }).map((_, i) => ({
        id: `mock-user-${i}`,
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        lastName: `Test`,
        phone: '123-456-7890',
        country: i % 3 === 0 ? 'France' : i % 3 === 1 ? 'USA' : 'Germany',
        acceptedMembership: true,
        acceptedMarketing: i % 2 === 0,
        walletAddress: `0.0.${12345 + i}`,
        partnerCode: i % 3 === 0 ? 'HEDERA-FR' : i % 3 === 1 ? 'DAR-BLOCKCHAIN' : 'HBAR-FOUNDATION',
        percentageCompleted: i % 4 === 0 ? 100 : Math.floor(Math.random() * 90),
        createdAt: new Date(2023, i % 12, (i * 2) % 28).toISOString(),
        completedAt: i % 4 === 0 ? new Date(2023, i % 12, (i * 2) % 28 + 2).toISOString() : null,
        finalScore: i % 4 === 0 ? 80 + (i % 20) : 0,
        finalGrade: i % 4 === 0 ? 'Pass' : 'Pending',
        caStatus: i % 10 === 0 ? 'Flagged' : 'Active'
    }));
};

export const MOCK_ADMIN_TEAM: AdminUser[] = [
    {
        id: 'admin_1',
        name: 'Alice Director',
        email: 'alice@hedera.com',
        role: UserRole.SUPER_ADMIN,
        assignedCodes: [], // All
        lastLogin: new Date().toISOString(),
        status: 'Active'
    }
];
