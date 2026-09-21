# Desktop module audit

Directory metadata snapshot checked September 21, 2026. This is not a runtime validation or a popularity ranking.

Source: [pinned React Native Directory data](https://github.com/react-native-community/directory/blob/8067cc2b75a9d53925e7cfbff10dc3622e86d94b/react-native-libraries.json).

## Status definitions

- Working: Directory explicitly lists support, or the community row includes Jay's explicit support update. Version and architecture compatibility still need testing.
- Partial: Directory names an alternate implementation, or a separately documented adapter only provides a subset.
- Unsupported: explicit negative evidence. Absence of a platform flag is **not** negative evidence.
- In progress: implementation work reported by Jay; not a claim of completed support.
- `?`: desktop support is unlisted in this source; this audit has not tested it. It may work.

## Onstage Expo selection

The Expo Modules slide follows Existing Modules and shows 15 packages on one page. Selected by monthly npm downloads after filtering out mobile-only UI, mobile splash screens, build/dev tooling, the umbrella package and internal infrastructure. This is a curated desktop-relevant subset, not the unfiltered Expo top 15. The full audit remains below.

[Download ranking source](https://reactnative.directory/api/libraries?order=downloads&limit=100&skipTools=true).

| Package | Monthly downloads |
| --- | ---: |
| expo-constants | 35,787,647 |
| expo-file-system | 34,782,427 |
| expo-asset | 32,531,594 |
| expo-keep-awake | 30,471,274 |
| expo-font | 30,314,014 |
| expo-linking | 22,339,293 |
| expo-secure-store | 20,844,456 |
| expo-router | 20,532,233 |
| expo-web-browser | 18,764,052 |
| expo-application | 17,815,881 |
| expo-symbols | 17,437,092 |
| expo-notifications | 16,371,548 |
| expo-image | 15,595,012 |
| expo-glass-effect | 15,387,478 |
| expo-crypto | 14,196,052 |

## All Expo entries in Directory

This includes SDK and tooling entries present in Directory, not an assertion that Directory contains every Expo package. Upstream package status is kept separate from Frame adapters.

| Package | macOS | Windows |
| --- | --- | --- |
| [@expo/app-integrity](https://github.com/expo/expo/tree/main/packages/expo-app-integrity) | ? | ? |
| [@expo/dom-webview](https://github.com/expo/expo/tree/main/packages/%40expo/dom-webview) | ? | ? |
| [@expo/fingerprint](https://github.com/expo/expo/tree/main/packages/@expo/fingerprint) | ? | ? |
| [@expo/html-elements](https://github.com/expo/expo/tree/main/packages/html-elements) | ? | ? |
| [@expo/metro-runtime](https://github.com/expo/expo/tree/main/packages/@expo/metro-runtime) | working | ? |
| [@expo/router-server](https://github.com/expo/expo/tree/main/packages/%40expo/router-server) | ? | ? |
| [expo](https://github.com/expo/expo/tree/main/packages/expo) | ? | ? |
| [expo-age-range](https://github.com/expo/expo/tree/main/packages/expo-age-range) | ? | ? |
| [expo-apple-authentication](https://github.com/expo/expo/tree/main/packages/expo-apple-authentication) | ? | ? |
| [expo-application](https://github.com/expo/expo/tree/main/packages/expo-application) | ? | ? |
| [expo-asset](https://github.com/expo/expo/tree/main/packages/expo-asset) | ? | ? |
| [expo-audio](https://github.com/expo/expo/tree/main/packages/expo-audio) | ? | ? |
| [expo-auth-session](https://github.com/expo/expo/tree/main/packages/expo-auth-session) | ? | ? |
| [expo-background-fetch](https://github.com/expo/expo/tree/main/packages/expo-background-fetch) | ? | ? |
| [expo-background-task](https://github.com/expo/expo/tree/main/packages/expo-background-task) | ? | ? |
| [expo-battery](https://github.com/expo/expo/tree/main/packages/expo-battery) | ? | ? |
| [expo-blur](https://github.com/expo/expo/tree/main/packages/expo-blur) | ? | ? |
| [expo-brightness](https://github.com/expo/expo/tree/main/packages/expo-brightness) | ? | ? |
| [expo-build-properties](https://github.com/expo/expo/tree/main/packages/expo-build-properties) | ? | ? |
| [expo-calendar](https://github.com/expo/expo/tree/main/packages/expo-calendar) | ? | ? |
| [expo-camera](https://github.com/expo/expo/tree/main/packages/expo-camera) | ? | ? |
| [expo-cellular](https://github.com/expo/expo/tree/main/packages/expo-cellular) | ? | ? |
| [expo-checkbox](https://github.com/expo/expo/tree/main/packages/expo-checkbox) | ? | ? |
| [expo-clipboard](https://github.com/expo/expo/tree/main/packages/expo-clipboard) | ? | ? |
| [expo-constants](https://github.com/expo/expo/tree/main/packages/expo-constants) | ? | ? |
| [expo-contacts](https://github.com/expo/expo/tree/main/packages/expo-contacts) | ? | ? |
| [expo-crypto](https://github.com/expo/expo/tree/main/packages/expo-crypto) | ? | ? |
| [expo-dev-client](https://github.com/expo/expo/tree/main/packages/expo-dev-client) | ? | ? |
| [expo-device](https://github.com/expo/expo/tree/main/packages/expo-device) | ? | ? |
| [expo-document-picker](https://github.com/expo/expo/tree/main/packages/expo-document-picker) | ? | ? |
| [expo-file-system](https://github.com/expo/expo/tree/main/packages/expo-file-system) | ? | ? |
| [expo-font](https://github.com/expo/expo/tree/main/packages/expo-font) | ? | ? |
| [expo-gl](https://github.com/expo/expo/tree/main/packages/expo-gl) | ? | ? |
| [expo-glass-effect](https://github.com/expo/expo/tree/main/packages/expo-glass-effect) | ? | ? |
| [expo-haptics](https://github.com/expo/expo/tree/main/packages/expo-haptics) | ? | ? |
| [expo-image](https://github.com/expo/expo/tree/main/packages/expo-image) | ? | ? |
| [expo-image-manipulator](https://github.com/expo/expo/tree/main/packages/expo-image-manipulator) | ? | ? |
| [expo-image-picker](https://github.com/expo/expo/tree/main/packages/expo-image-picker) | ? | ? |
| [expo-insights](https://github.com/expo/expo/tree/main/packages/expo-insights) | ? | ? |
| [expo-intent-launcher](https://github.com/expo/expo/tree/main/packages/expo-intent-launcher) | ? | ? |
| [expo-json-utils](https://github.com/expo/expo/tree/main/packages/expo-json-utils) | ? | ? |
| [expo-keep-awake](https://github.com/expo/expo/tree/main/packages/expo-keep-awake) | ? | ? |
| [expo-linear-gradient](https://github.com/expo/expo/tree/main/packages/expo-linear-gradient) | ? | ? |
| [expo-linking](https://github.com/expo/expo/tree/main/packages/expo-linking) | ? | ? |
| [expo-local-authentication](https://github.com/expo/expo/tree/main/packages/expo-local-authentication) | ? | ? |
| [expo-localization](https://github.com/expo/expo/tree/main/packages/expo-localization) | ? | ? |
| [expo-location](https://github.com/expo/expo/tree/main/packages/expo-location) | ? | ? |
| [expo-mail-composer](https://github.com/expo/expo/tree/main/packages/expo-mail-composer) | ? | ? |
| [expo-manifests](https://github.com/expo/expo/tree/main/packages/expo-manifests) | ? | ? |
| [expo-maps](https://github.com/expo/expo/tree/main/packages/expo-maps) | ? | ? |
| [expo-media-library](https://github.com/expo/expo/tree/main/packages/expo-media-library) | ? | ? |
| [expo-mesh-gradient](https://github.com/expo/expo/tree/main/packages/expo-mesh-gradient) | ? | ? |
| [expo-modules-jsi](https://github.com/expo/expo/tree/main/packages/expo-modules-jsi) | ? | ? |
| [expo-navigation-bar](https://github.com/expo/expo/tree/main/packages/expo-navigation-bar) | ? | ? |
| [expo-network](https://github.com/expo/expo/tree/main/packages/expo-network) | ? | ? |
| [expo-notifications](https://github.com/expo/expo/tree/main/packages/expo-notifications) | ? | ? |
| [expo-print](https://github.com/expo/expo/tree/main/packages/expo-print) | ? | ? |
| [expo-router](https://github.com/expo/expo/tree/main/packages/expo-router) | ? | ? |
| [expo-screen-capture](https://github.com/expo/expo/tree/main/packages/expo-screen-capture) | ? | ? |
| [expo-screen-orientation](https://github.com/expo/expo/tree/main/packages/expo-screen-orientation) | ? | ? |
| [expo-secure-store](https://github.com/expo/expo/tree/main/packages/expo-secure-store) | ? | ? |
| [expo-sensors](https://github.com/expo/expo/tree/main/packages/expo-sensors) | ? | ? |
| [expo-sharing](https://github.com/expo/expo/tree/main/packages/expo-sharing) | ? | ? |
| [expo-sms](https://github.com/expo/expo/tree/main/packages/expo-sms) | ? | ? |
| [expo-speech](https://github.com/expo/expo/tree/main/packages/expo-speech) | ? | ? |
| [expo-splash-screen](https://github.com/expo/expo/tree/main/packages/expo-splash-screen) | ? | ? |
| [expo-sqlite](https://github.com/expo/expo/tree/main/packages/expo-sqlite) | ? | ? |
| [expo-status-bar](https://github.com/expo/expo/tree/main/packages/expo-status-bar) | ? | ? |
| [expo-store-review](https://github.com/expo/expo/tree/main/packages/expo-store-review) | ? | ? |
| [expo-structured-headers](https://github.com/expo/expo/tree/main/packages/expo-structured-headers) | ? | ? |
| [expo-symbols](https://github.com/expo/expo/tree/main/packages/expo-symbols) | ? | ? |
| [expo-system-ui](https://github.com/expo/expo/tree/main/packages/expo-system-ui) | ? | ? |
| [expo-task-manager](https://github.com/expo/expo/tree/main/packages/expo-task-manager) | ? | ? |
| [expo-tracking-transparency](https://github.com/expo/expo/tree/main/packages/expo-tracking-transparency) | ? | ? |
| [expo-updates](https://github.com/expo/expo/tree/main/packages/expo-updates) | ? | ? |
| [expo-video](https://github.com/expo/expo/tree/main/packages/expo-video) | ? | ? |
| [expo-video-thumbnails](https://github.com/expo/expo/tree/main/packages/expo-video-thumbnails) | ? | ? |
| [expo-web-browser](https://github.com/expo/expo/tree/main/packages/expo-web-browser) | ? | ? |
| [expo-widgets](https://github.com/expo/expo/tree/main/packages/expo-widgets) | ? | ? |
| [jest-expo](https://github.com/expo/expo/tree/main/packages/jest-expo) | ? | ? |
| [patch-project](https://github.com/expo/expo/tree/main/packages/patch-project) | ? | ? |

## Representative community libraries

Eleven selected libraries. Directory metadata is supplemented by Jay's September 21 updates: MMKV, Skia and Nitro Modules work on macOS; Vision Camera is in progress on both platforms. These overrides are recorded per row in the JSON snapshot. Unknown status is displayed as `?`.

| Package | macOS | Windows |
| --- | --- | --- |
| [react-native-reanimated](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-reanimated) | working | ? |
| [react-native-gesture-handler](https://github.com/software-mansion/react-native-gesture-handler/tree/main/packages/react-native-gesture-handler) | working | ? |
| [react-native-svg](https://github.com/software-mansion/react-native-svg) | working | working |
| [react-native-webview](https://github.com/react-native-webview/react-native-webview) | working | working |
| [react-native-mmkv](https://github.com/margelo/react-native-mmkv/tree/main/packages/react-native-mmkv) | working | ? |
| [@shopify/react-native-skia](https://github.com/Shopify/react-native-skia/tree/main/packages/skia) | working | ? |
| [react-native-vision-camera](https://github.com/margelo/react-native-vision-camera/tree/main/packages/react-native-vision-camera) | in-progress | in-progress |
| [react-native-worklets](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-worklets) | ? | ? |
| [@sentry/react-native](https://github.com/getsentry/sentry-react-native/tree/main/packages/core) | ? | ? |
| [@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo) | working | working |
| [react-native-nitro-modules](https://github.com/margelo/nitro/tree/main/packages/react-native-nitro-modules) | working | ? |

## Replacement candidates

[Directory query](https://reactnative.directory/api/libraries?order=downloads&limit=100&hasNativeCode=true&skipTools=true), checked September 21, 2026. Historical candidates used for selection; the current onstage list is above. Counts include dependency installs; they are not counts of apps or developers.

| Package | Monthly downloads |
| --- | ---: |
| [@react-navigation/native](https://github.com/react-navigation/react-navigation/tree/main/packages/native) | 24,177,470 |
| [react-native-worklets](https://github.com/software-mansion/react-native-reanimated/tree/main/packages/react-native-worklets) | 21,905,961 |
| [@react-native-masked-view/masked-view](https://github.com/callstack/masked-view) | 13,931,892 |
| [@sentry/react-native](https://github.com/getsentry/sentry-react-native/tree/main/packages/core) | 11,706,184 |
| [@react-native-community/netinfo](https://github.com/react-native-netinfo/react-native-netinfo) | 10,691,097 |
| [@react-native-community/datetimepicker](https://github.com/react-native-datetimepicker/datetimepicker) | 8,889,556 |
| [react-native-get-random-values](https://github.com/LinusU/react-native-get-random-values) | 8,746,684 |
| [react-native-keyboard-controller](https://github.com/kirillzyusko/react-native-keyboard-controller) | 8,242,628 |
| [react-native-nitro-modules](https://github.com/margelo/nitro/tree/main/packages/react-native-nitro-modules) | 6,562,646 |
| [@react-native-firebase/app](https://github.com/invertase/react-native-firebase/tree/main/packages/app) | 5,564,312 |
