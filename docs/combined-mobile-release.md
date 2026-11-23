# Combined mobile release

Branch: `codex/mobile-all-changes-release`.

This branch combines the committed `newUI2026` changes and its local mobile app changes with the Android Material 3 native tabs, distinct meeting/event icons, and iOS HRMS Liquid Glass integration. The original working folder is preserved.

Version: 2.4.0. Android version code: 176. iOS build number: 201.

The `release` EAS profile inherits production signing/channel settings and disables automatic increments because both native projects and app.json already use these exact build numbers.

```sh
eas build --platform android --profile release --local
eas build --platform ios --profile release --local
```

Android runtime: `2.4.0-sdk58-android-tabs-v2`. iOS runtime: `2.4.0-sdk58`. New runtimes isolate these binaries from previous OTA updates. Building does not submit to either store or publish an OTA update.

The expo-modules-core 58.0.27 patch avoids the installed Swift compiler crash when handling async-function errors. Existing postinstall patch-package applies it on fresh installs.

Release checks include attendance permissions, location choices, listing pagination, duration/source display, role access, headers, both native tab integrations, and Android production JavaScript bundling. iOS App Store IPA 2.4.0 (201) was built locally and verified for bundle ID, build number, runtime, code signature and distribution provisioning. Five older checks also fail in the original checkout: call-reminder coordination, cross-repository HR-admin protection, HRM listing search, interview phone validation and interview tab permission. These are not presented as passing release checks.

The earlier 2.3.10 Android build was stopped after the version changed to 2.4.0. Local iOS prerequisites on this Mac are now configured: Fastlane is installed for Ruby 3.3 and its user binary directory is in zsh PATH; the official Apple WWDR G3 intermediate is installed in the login keychain. The production profile incremented iOS build 200 to 201. The release profile preserves that number for retries; use production for a subsequent new build number.

Verified iOS artifact: `zellix-2.4.0-ios.ipa` (Git-ignored), 23.3 MB. SHA-256: `1ade9d643c19923cd55b0a34adf5501a18cc6576b886d410b3dfceb5df87778a`.
