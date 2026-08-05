// Shared admin allowlist - safe to import from both client components and
// server routes (no secrets, no server-only imports). lib/adminAuth.ts
// (server-only) and app/admin/layout.tsx (client guard) both use this so
// there's one list instead of copies drifting out of sync.
export const ADMIN_EMAILS = [
    'admin@mutant.tech',
    'prince@mutant.tech',
    'princekhimani@gmail.com',
    'princekhimani186@gmail.com',
    'princekhimani78@gmail.com',
    'prince@mutanttechnologies.com',
];
