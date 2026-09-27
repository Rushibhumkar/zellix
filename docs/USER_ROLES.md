# User roles

Role values are persisted strings. Keep the role catalogs in backend `utils/roles.js`, web `src/utils/roles.js`, and mobile `utils/roles.ts` aligned. The mobile catalog exposes a TypeScript enum; JavaScript projects expose frozen enum objects.

All existing values remain valid, including legacy `pnl`, `manager`, `assistant_manager`, and camel-case `contentCreator`. New role values are `hr`, `developer`, `marketing`, and `office_admin` (HR and Developer already existed in some clients). Labels are separate from persisted values.

Ordinary user selectors exclude Super Admin. Team-specific HRM selectors preserve the existing sales hierarchy restrictions and also offer non-sales roles. Adding a role does not grant module permissions; the existing permission system still applies.

The User model and create/update endpoints reject unknown role values. No database migration is performed. Audit any externally created/custom database role values against the catalog before deployment.
