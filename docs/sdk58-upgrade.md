# Expo SDK 58 upgrade

The dependency tree targets Expo 58, React 19.3 and React Native 0.88.
Run `npm ci` to reproduce the lockfile. The postinstall script applies the
version-specific `react-native-modal` patch: it removes the deleted RN
InteractionManager API and cleans up Android back subscriptions with `.remove()`.
Animation promises and modal show/hide callbacks remain unchanged.

Country picker v3 supports React 19 and preserves the props used by MobileInput.
Splash settings now use the expo-splash-screen plugin. Android Gradle/AGP settings
and the iOS scene lifecycle were migrated without regenerating native folders.

## Local Expo Go

From the mobile repository, stop an existing Metro process in its own terminal
before starting another server on the same port:

```sh
npx expo start --go --clear
```

Use an SDK 58-compatible Expo Go. Custom native features cannot be validated in
Expo Go; old SDK 57 development clients must be rebuilt before using this bundle.

## Before a native release

- Install updated iOS pods and build/test both native projects on devices. JS
  exports and mocked regression tests do not replace native build/device testing.
- Expo Doctor's non-CNG warning remains intentional: tracked android/ios folders
  mean app.json plugins are NOT automatically applied to native builds. Review
  future config changes in native files too; do not delete these custom projects.
- Runtime `2.3.1-sdk58` is isolated from old SDK 57 runtime `2.3.1`. Never publish
  SDK 58 JS against the old runtime. No OTA or store release was published here.
- The repository-wide TypeScript check still reports numerous typing errors;
  it is not a passing release gate for this upgrade.

Checks: `npx expo install --check`, `npx expo-doctor`, Android/iOS Expo export,
`node scripts/testSDK58Compatibility.cjs` and the existing regression scripts.

References: [SDK upgrade guide](https://docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough/)
and [native upgrade helper](https://docs.expo.dev/bare/upgrade/).
