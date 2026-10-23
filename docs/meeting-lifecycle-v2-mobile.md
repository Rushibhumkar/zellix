# Mobile meeting lifecycle v2

Requires the matching lifecycle-v2 backend. This mobile change does not migrate
data or modify backend code. Legacy/migration-blocked histories stay read-only;
an administrator must reconcile them with the backend migration tools.

- Creation and follow-up use `/api/meeting/eligibility/:leadId`. The lead owner is
  responsible and always participates. Self is ownership-derived, not editable.
  Add/edit/reschedule do not display a Self switch or its info icon, matching Web;
  the backend-required ownership value is still derived and sent automatically.
- Supporting members come from `/api/meeting/member-options`, not the global
  Redux user list. Rescheduling/editing preserves responsibility and Self.
  Selected chips and submitted supporting IDs are deduplicated and intersected
  with that endpoint's current eligible users, excluding the responsible person,
  just like Web. Historical users are not merged into selectable options. A
  pending/failed member-options request blocks saving rather than clearing IDs.
- Management buttons use server `capabilities.manage`, lifecycle version and
  latest-entry status. Conduct additionally waits until scheduled time (including
  overdue meetings). Follow-up eligibility is independent of management rights.
- Edit/reschedule/conduct/cancel/follow-up send the version and latest entry ID
  captured by their screen/dialog. They never fetch a newer version to silently
  overwrite another user's intervening changes. 409/428 errors refresh details;
  stale edit/reschedule/follow-up forms return to details for reopening.
- Create/follow-up/reschedule retain a request ID for unchanged submission retries.
  A response-lost create retry can replay the same request even if eligibility
  now reports its just-created open appointment. A changed draft cannot bypass
  the open-appointment eligibility guard.
- Add/follow-up shows the backend eligibility reason near the lead selection and
  an “Open existing meeting” link when the response includes a meeting ID. Submit
  is disabled while checking, on check failure or when blocked; submission also
  refreshes eligibility. Returning from details refreshes the check. Creation
  conflicts retain the existing-meeting link and clear the uncertain-retry
  exception; response-lost network retries still use their original request ID.
  If a blocked response omits `meetingId`, mobile reads the authorized lead
  history and links only a unique scheduled/rescheduled group (matching the
  responsible person when known). Empty/ambiguous history never yields a guessed
  ID; failed lookups offer Retry. Details navigation pushes within the meeting
  stack or targets the parent's MeetingsNavigator from a lead stack; unavailable
  routes produce a message instead of an unhandled navigation action.
- OTP verification is not requested: the backend release disables it. Conduct
  requires completion remarks; location is recorded only when available.
- Staff reminder delivery, final-participant credit and report aggregation remain
  server responsibilities. A compact Meeting reminders row opens an office-wide
  settings sheet for super admins, sub admins and developers (same as Web/backend).
  It fetches on opening, saves through `/api/meeting/settings`, and validates
  1–10 unique whole-minute offsets (0–10080) with independent Email/Push channels.
  Client reminders remain separate. Failed saves retain the draft for retry.
- Tapping a staff meeting notification queues its meeting ID until authenticated
  tabs, Meeting permission, and root navigation are available, then opens details.

## Checks

Run `node scripts/testMeetingLifecycle.cjs` for pure lifecycle policy and mocked
actual form/API submission checks. Export Android and iOS bundles with Expo.
Run `node scripts/testMeetingReminderSettings.cjs` for reminder validation,
role visibility, loading/error states and mocked settings API interactions.
The existing project-wide TypeScript errors in shared UI/navigation components
remain outside this integration; native bundle compilation is a separate check.

Before production, manually verify real accounts (owner, creator, supporting
member, admin), migration-blocked history, lead reassignment, timezone display,
location allowed/denied, offline retry, and two devices editing the same entry.
Automated checks do not replace physical Android/iOS verification.
