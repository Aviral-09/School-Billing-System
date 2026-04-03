/**
 * Single School Identity Configuration
 * This is the single source of truth for the school's identity.
 * Change these values to rebrand the system for your institution.
 */
export const SCHOOL_CONFIG = {
    name: 'Sunrise Public School',
    shortName: 'SPS',
    tagline: 'Empowering Students, Building Futures',
    email: 'admin@sunrisepublicschool.edu.in',
    phone: '+91 98765 43210',
    address: '12, Knowledge Park, New Delhi – 110001',
    website: 'www.sunrisepublicschool.edu.in',
    academicYear: '2025–2026',
} as const;

/**
 * Full class list for the school (Class 1 – Class 12).
 * Used in every dropdown, filter, and form across the app.
 * Single source of truth — edit here to rename or extend.
 */
export const CLASSES: string[] = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`);
