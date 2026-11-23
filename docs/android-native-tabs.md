# Android native bottom tabs

Android CRM and HRMS tabs use standard Material 3 BottomNavigationView through the local
`zellix-glass-tabs` Expo module. iOS CRM keeps its existing Liquid Glass module;
iOS HRMS remains unchanged. React Navigation 6 still owns all screen stacks,
permissions, deep links, back behavior and preventable tab-press events.

Native selection responds on the UI thread. The key/requestId acknowledgement
protocol rejects stale React renders while taps are pending, and React resolves
accepted/prevented presses. Rapid taps are coalesced to the latest destination.
Screen rendering still runs through React; this does not eliminate heavy-screen
JavaScript work.

The Android bar supports one to five visible permitted tabs, native TalkBack
labels, reselect/long-press events, keyboard hiding and system bottom insets.
Missing native modules (older clients/Expo Go), unsupported platforms, or more
than five routes use the existing JavaScript tab-bar fallback. HRMS keeps a
normal-flow bar so its content retains bottom space; Android CRM also uses a full-width normal-flow bar. iOS CRM keeps its existing floating Liquid Glass bar.

## Build and update compatibility

A new Android development/store binary is required. Rebuild locally with
`npx expo run:android --device`, or use
`eas build --profile development --platform android` for a development client.
This module cannot be installed with an OTA update.

Android's runtime is `2.3.9-sdk58-android-tabs-v2`, synchronized between app.json
and Android strings.xml. In this isolated Android release, the shared/iOS runtime stays at the selected base’s `2.3.7-sdk58`; iOS native files are unchanged.
For later native changes, update the appropriate runtime alongside native config.
Do not retarget this bundle to an incompatible installed native runtime.

## Verification

- `node scripts/testNativeBottomTabs.cjs`: navigation bridge/fallback checks.
- `cd android && ./gradlew :zellix-glass-tabs:testDebugUnitTest`: native selection tests.
- Install a newly built Android client and check rapid first/last-tab taps,
  permission-dependent tab counts, Data-tab reset, hardware Back, keyboard
  open/close, gesture/three-button navigation, larger font sizes and TalkBack.

## Isolated Android release checkout

- Base: `9dc7a5c276b4d9934a4f76a3b9968e86a353bcce`, explicitly selected from the EAS-recorded source commit for Android production build `d08fbfa6-4260-4029-8cf3-a2731187809b` (2.3.8 / 174).
- That commit contains version 2.3.7 / 173. The EAS build therefore included source/config changes absent from the recorded commit; this checkout does not claim to reproduce its exact uploaded source.
- Only the Android native module, module registration, CRM/HRMS tab integration, Android runtime, Android version config, cache ignore, this guide and the bridge test are added to that base.
- Pending attendance, permission screens, auth, API and header changes from the original working folder are excluded. No iOS native files are changed.
- Android version is synchronized to 2.3.9 / 175 after the successful local production build. The existing production profile retains `autoIncrement: true`; a subsequent production build increments the code again.
- Android runtime: `2.3.9-sdk58-android-tabs-v2`; shared/iOS runtime remains `2.3.7-sdk58` from the selected base.
- After installing dependencies in this checkout, build with `eas build --platform android --profile production`. No build, submission or OTA publication is triggered by preparing this branch.

### Isolation verification completed

- Native tab bridge/fallback/runtime checks passed.
- Android Metro production export passed (2834 modules).
- `:zellix-glass-tabs:testDebugUnitTest`: 8 tests, 0 failures/errors.
- `:app:compileDebugKotlin`: passed with the native module autolinked.
- No device smoke test, Play submission or Git push was performed during isolation. The later signed AAB build is recorded below.
- A temporary symlink to the original checkout’s unchanged dependencies was used for verification and removed afterwards. Run `npm ci` here before further local build commands.

## Local production build — 2026-11-23

- Built only from `codex/android-native-tabs-release` with `eas build --platform android --profile production --local`.
- Artifact: `zellix-2.3.9-android.aab` (Git-ignored).
- Verified bundle manifest: `com.skg.zellix`, version `2.3.9`, version code `175`.
- Verified Android runtime `2.3.9-sdk58-android-tabs-v1` in compiled resources and Android native-tabs module in DEX.
- JAR signature verified; the signing certificate differs from the temporary local debug certificate.
- SHA-256: `8e35014a7469bec45b2c22d1c8d95efec01d95140b10357deb31cb318f57a66b`.
- Expo Doctor reported existing native-folder config-sync and SDK dependency-version checks; dependency upgrades were excluded from this native-tabs-only release. Gradle bundleRelease completed successfully.
- No Play submission, OTA publication or Git push was performed.

## Standard Android Material 3 navigation

- Uses the native Material 3 theme, pill active indicator, ripple, and icon/label layout with Zellix blue and a light blue surface.
- No floating card, rounded outer border, horizontal inset, bitmap icon capture or custom indicator drawing on Android. Native vector icons are supplied to the standard Material widget.
- CRM and HRMS reserve the bar's normal layout height: 80 dp plus the device bottom inset, applied once.
- Android runtime is now `2.3.9-sdk58-android-tabs-v2`. The earlier `zellix-2.3.9-android.aab` built above contains the previous v1 design and is not the updated Material 3 build. A new native Android build is required; the next production build auto-increments version code from 175 to 176.
- iOS native files, Liquid Glass appearance, floating placement, height and keyboard handling remain unchanged.
