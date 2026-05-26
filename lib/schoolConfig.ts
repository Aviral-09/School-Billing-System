/**
 * Single School Identity Configuration
 * This is the single source of truth for the school's identity.
 * Change these values to rebrand the system for your institution.
 */
export const SCHOOL_CONFIG = {
    name: 'Swaami Dayanand Saraswati Public School',
    shortName: 'SDS',
    tagline: 'Empowering Students, Building Futures',
    email: 'admin@sunrisepublicschool.edu.in',
    phone: '+91 98765 43210',
    address: '12, Knowledge Park, New Delhi – 110001',
    website: 'www.sunrisepublicschool.edu.in',
    academicYear: '2025–2026',
} as const;

export const CLASSES: string[] = [
    'Nursery', 'LKG', 'UKG',
    ...Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`)
];

export const SESSIONS: string[] = ['2024-25', '2025-26', '2026-27', '2027-28'];
