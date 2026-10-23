# Android lead-call return

Lead Details keeps its underlying content mounted while the native dialer is
open. Its call-status modal is mounted only after Android is active and the
screen focused for 500 ms. A background/inactive event cancels this presentation
delay; requested popup state survives until a stable return.

The call-return timer waits 600 ms on Android (350 ms retained on iOS), accepts
background → inactive → active transitions, and cancels on interruption without
discarding pending tracking. Finished metadata is set only on finalization, not
on transient foreground events. The dial-intent lease transfers to the outcome
UI lease before reminders are allowed. Repeated call taps and failed launches
cannot leave duplicate dialers or stale completion timers.

Run `node scripts/testCallReminderCoordination.cjs`. These are deterministic
checks of actual handlers and hooks, not native-window/device emulation.

Before release, install the updated Android build and test:

- Lead Details call → return → Change Status, submit and dismiss (when allowed).
- Return via Recents; return with an intervening notification/inactive state.
- Brief return followed by backgrounding; reopen and confirm one outcome only.
- A reminder arriving during a call; it must wait until call UI is dismissed.
- Fast double tap, dialer launch failure, ignored/over-limit durations.
- Process recreation during a call, pending-call recovery and iOS regression.

No on-device reproduction was completed during this change: ADB authorization
was granted, but the connected device had Expo Go and no installed
`com.skg.zellix` package when checked. Native blank-screen root cause therefore
remains unconfirmed; this change fixes the identified resume/dialog races.
