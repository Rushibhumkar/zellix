# Combined mobile release

Branch: `codex/mobile-all-changes-release`.

This branch combines the committed `newUI2026` changes and its local mobile app changes with the Android Material 3 native tabs, distinct meeting/event icons, and iOS HRMS Liquid Glass integration. The original working folder is preserved.

Version: 2.4.0. Android version code: 176. iOS build number: 200.

The `release` EAS profile inherits production signing/channel settings and disables automatic increments because both native projects and app.json already use these exact build numbers.

```sh
eas build --platform android --profile release --local
eas build --platform ios --profile release
```

Android runtime: `2.4.0-sdk58-android-tabs-v2`. iOS runtime: `2.4.0-sdk58`. New runtimes isolate these binaries from previous OTA updates. Building does not submit to either store or publish an OTA update.

The expo-modules-core 58.0.27 patch avoids the installed Swift compiler crash when handling async-function errors. Existing postinstall patch-package applies it on fresh installs.

Release checks include attendance permissions, location choices, listing pagination, duration/source display, role access, headers, both native tab integrations, and Android production JavaScript bundling. Native release artifacts have not been completed. Five older checks also fail in the original checkout: call-reminder coordination, cross-repository HR-admin protection, HRM listing search, interview phone validation and interview tab permission. These are not presented as passing release checks.

The earlier 2.3.10 Android build was stopped after the version changed to 2.4.0. The iOS local attempt failed during signing because the distribution certificate could not be imported into the temporary keychain on this Mac. The iOS command above uses EAS cloud to avoid that local keychain issue. A local iOS build additionally requires Fastlane and a working distribution identity.
