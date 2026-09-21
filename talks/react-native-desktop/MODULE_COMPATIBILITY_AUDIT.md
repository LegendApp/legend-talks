# Desktop module audit

Directory metadata snapshot checked September 21, 2026. This is not a runtime validation or a popularity ranking.

Source: [pinned React Native Directory data](https://github.com/react-native-community/directory/blob/8067cc2b75a9d53925e7cfbff10dc3622e86d94b/react-native-libraries.json).

## Status definitions

- Working: Directory explicitly lists support. Version and architecture compatibility still need testing.
- Partial: Directory names an alternate implementation, or a separately documented adapter only provides a subset.
- Unsupported: explicit negative evidence. Absence of a platform flag is **not** negative evidence.
- Untested: desktop support is unlisted in this source; this audit has not tested it. It may work.

## All Expo entries in Directory

This includes SDK and tooling entries present in Directory, not an assertion that Directory contains every Expo package. Upstream package status is kept separate from Frame adapters.

| Package | macOS | Windows |
| --- | --- | --- |
| [@expo/app-integrity](https://github.com/expo/expo/tree/main/packages/expo-app-integrity) | untested | untested |
| [@expo/dom-webview](https://github.com/expo/expo/tree/main/packages/%40expo/dom-webview) | untested | untested |
| [@expo/fingerprint](https://github.com/expo/expo/tree/main/packages/@expo/fingerprint) | untested | untested |
| [@expo/html-elements](https://github.com/expo/expo/tree/main/packages/html-elements) | untested | untested |
| [@expo/metro-runtime](https://github.com/expo/expo/tree/main/packages/@expo/metro-runtime) | working | untested |
| [@expo/router-server](https://github.com/expo/expo/tree/main/packages/%40expo/router-server) | untested | untested |
| [expo](https://github.com/expo/expo/tree/main/packages/expo) | untested | untested |
| [expo-age-range](https://github.com/expo/expo/tree/main/packages/expo-age-range) | untested | untested |
| [expo-apple-authentication](https://github.com/expo/expo/tree/main/packages/expo-apple-authentication) | untested | untested |
| [expo-application](https://github.com/expo/expo/tree/main/packages/expo-application) | untested | untested |
| [expo-asset](https://github.com/expo/expo/tree/main/packages/expo-asset) | untested | untested |
| [expo-audio](https://github.com/expo/expo/tree/main/packages/expo-audio) | untested | untested |
| [expo-auth-session](https://github.com/expo/expo/tree/main/packages/expo-auth-session) | untested | untested |
| [expo-background-fetch](https://github.com/expo/expo/tree/main/packages/expo-background-fetch) | untested | untested |
| [expo-background-task](https://github.com/expo/expo/tree/main/packages/expo-background-task) | untested | untested |
| [expo-battery](https://github.com/expo/expo/tree/main/packages/expo-battery) | untested | untested |
| [expo-blur](https://github.com/expo/expo/tree/main/packages/expo-blur) | untested | untested |
| [expo-brightness](https://github.com/expo/expo/tree/main/packages/expo-brightness) | untested | untested |
| [expo-build-properties](https://github.com/expo/expo/tree/main/packages/expo-build-properties) | untested | untested |
| [expo-calendar](https://github.com/expo/expo/tree/main/packages/expo-calendar) | untested | untested |
| [expo-camera](https://github.com/expo/expo/tree/main/packages/expo-camera) | untested | untested |
| [expo-cellular](https://github.com/expo/expo/tree/main/packages/expo-cellular) | untested | untested |
| [expo-checkbox](https://github.com/expo/expo/tree/main/packages/expo-checkbox) | untested | untested |
| [expo-clipboard](https://github.com/expo/expo/tree/main/packages/expo-clipboard) | untested | untested |
| [expo-constants](https://github.com/expo/expo/tree/main/packages/expo-constants) | untested | untested |
| [expo-contacts](https://github.com/expo/expo/tree/main/packages/expo-contacts) | untested | untested |
| [expo-crypto](https://github.com/expo/expo/tree/main/packages/expo-crypto) | untested | untested |
| [expo-dev-client](https://github.com/expo/expo/tree/main/packages/expo-dev-client) | untested | untested |
| [expo-device](https://github.com/expo/expo/tree/main/packages/expo-device) | untested | untested |
| [expo-document-picker](https://github.com/expo/expo/tree/main/packages/expo-document-picker) | untested | untested |
| [expo-file-system](https://github.com/expo/expo/tree/main/packages/expo-file-system) | untested | untested |
| [expo-font](https://github.com/expo/expo/tree/main/packages/expo-font) | untested | untested |
| [expo-gl](https://github.com/expo/expo/tree/main/packages/expo-gl) | untested | untested |
| [expo-glass-effect](https://github.com/expo/expo/tree/main/packages/expo-glass-effect) | untested | untested |
| [expo-haptics](https://github.com/expo/expo/tree/main/packages/expo-haptics) | untested | untested |
| [expo-image](https://github.com/expo/expo/tree/main/packages/expo-image) | untested | untested |
| [expo-image-manipulator](https://github.com/expo/expo/tree/main/packages/expo-image-manipulator) | untested | untested |
| [expo-image-picker](https://github.com/expo/expo/tree/main/packages/expo-image-picker) | untested | untested |
| [expo-insights](https://github.com/expo/expo/tree/main/packages/expo-insights) | untested | untested |
| [expo-intent-launcher](https://github.com/expo/expo/tree/main/packages/expo-intent-launcher) | untested | untested |
| [expo-json-utils](https://github.com/expo/expo/tree/main/packages/expo-json-utils) | untested | untested |
| [expo-keep-awake](https://github.com/expo/expo/tree/main/packages/expo-keep-awake) | untested | untested |
| [expo-linear-gradient](https://github.com/expo/expo/tree/main/packages/expo-linear-gradient) | untested | untested |
| [expo-linking](https://github.com/expo/expo/tree/main/packages/expo-linking) | untested | untested |
| [expo-local-authentication](https://github.com/expo/expo/tree/main/packages/expo-local-authentication) | untested | untested |
| [expo-localization](https://github.com/expo/expo/tree/main/packages/expo-localization) | untested | untested |
| [expo-location](https://github.com/expo/expo/tree/main/packages/expo-location) | untested | untested |
| [expo-mail-composer](https://github.com/expo/expo/tree/main/packages/expo-mail-composer) | untested | untested |
| [expo-manifests](https://github.com/expo/expo/tree/main/packages/expo-manifests) | untested | untested |
| [expo-maps](https://github.com/expo/expo/tree/main/packages/expo-maps) | untested | untested |
| [expo-media-library](https://github.com/expo/expo/tree/main/packages/expo-media-library) | untested | untested |
| [expo-mesh-gradient](https://github.com/expo/expo/tree/main/packages/expo-mesh-gradient) | untested | untested |
| [expo-modules-jsi](https://github.com/expo/expo/tree/main/packages/expo-modules-jsi) | untested | untested |
| [expo-navigation-bar](https://github.com/expo/expo/tree/main/packages/expo-navigation-bar) | untested | untested |
| [expo-network](https://github.com/expo/expo/tree/main/packages/expo-network) | untested | untested |
| [expo-notifications](https://github.com/expo/expo/tree/main/packages/expo-notifications) | untested | untested |
| [expo-print](https://github.com/expo/expo/tree/main/packages/expo-print) | untested | untested |
| [expo-router](https://github.com/expo/expo/tree/main/packages/expo-router) | untested | untested |
| [expo-screen-capture](https://github.com/expo/expo/tree/main/packages/expo-screen-capture) | untested | untested |
| [expo-screen-orientation](https://github.com/expo/expo/tree/main/packages/expo-screen-orientation) | untested | untested |
| [expo-secure-store](https://github.com/expo/expo/tree/main/packages/expo-secure-store) | untested | untested |
| [expo-sensors](https://github.com/expo/expo/tree/main/packages/expo-sensors) | untested | untested |
| [expo-sharing](https://github.com/expo/expo/tree/main/packages/expo-sharing) | untested | untested |
| [expo-sms](https://github.com/expo/expo/tree/main/packages/expo-sms) | untested | untested |
| [expo-speech](https://github.com/expo/expo/tree/main/packages/expo-speech) | untested | untested |
| [expo-splash-screen](https://github.com/expo/expo/tree/main/packages/expo-splash-screen) | untested | untested |
| [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite) | untested | untested |
| [expo-status-bar](https://github.com/expo/expo/tree/main/packages/expo-status-bar) | untested | untested |
| [expo-store-review](https://github.com/expo/expo/tree/main/packages/expo-store-review) | untested | untested |
| [expo-structured-headers](https://github.com/expo/expo/tree/main/packages/expo-structured-headers) | untested | untested |
| [expo-symbols](https://github.com/expo/expo/tree/main/packages/expo-symbols) | untested | untested |
| [expo-system-ui](https://github.com/expo/expo/tree/main/packages/expo-system-ui) | untested | untested |
| [expo-task-manager](https://github.com/expo/expo/tree/main/packages/expo-task-manager) | untested | untested |
| [expo-tracking-transparency](https://github.com/expo/expo/tree/main/packages/expo-tracking-transparency) | untested | untested |
| [expo-updates](https://github.com/expo/expo/tree/main/packages/expo-updates) | untested | untested |
| [expo-video](https://github.com/expo/expo/tree/main/packages/expo-video) | untested | untested |
| [expo-video-thumbnails](https://github.com/expo/expo/tree/main/packages/expo-video-thumbnails) | untested | untested |
| [expo-web-browser](https://github.com/expo/expo/tree/main/packages/expo-web-browser) | untested | untested |
| [expo-widgets](https://github.com/expo/expo/tree/main/packages/expo-widgets) | untested | untested |
| [jest-expo](https://github.com/expo/expo/tree/main/packages/jest-expo) | untested | untested |
| [patch-project](https://github.com/expo/expo/tree/main/packages/patch-project) | untested | untested |

## Representative community libraries

Ten recognizable libraries, not a ranked top ten.

| Package | macOS | Windows |
| --- | --- | --- |
| [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-reanimated) | working | untested |
| [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler/tree/main/packages/react-native-gesture-handler) | working | untested |
| [react-native-svg](https://github.com/software-mansion/react-native-svg) | working | working |
| [react-native-webview](https://github.com/react-native-webview/react-native-webview) | working | working |
| [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage/tree/main/packages/async-storage) | working | working |
| [react-native-safe-area-context](https://github.com/AppAndFlow/react-native-safe-area-context) | untested | untested |
| [react-native-screens](https://github.com/software-mansion/react-native-screens) | untested | untested |
| [react-native-mmkv](https://github.com/margelo/react-native-mmkv/tree/main/packages/react-native-mmkv) | untested | untested |
| [@shopify/react-native-skia](https://github.com/Shopify/react-native-skia/tree/main/packages/skia) | untested | untested |
| [react-native-vision-camera](https://github.com/margelo/react-native-vision-camera/tree/main/packages/react-native-vision-camera) | untested | untested |

## Frame adapters shown separately onstage

Clipboard, SecureStore, and Linking have partial macOS API adapters in Frame, not upstream Expo desktop support. Evidence: `../legend-framework/docs/expo-api-adapters.md`, supported contracts and September 13 recorded macOS validation. Windows native acceptance remains pending; show untested. These overlays do not change the upstream Expo rows above.
