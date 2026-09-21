# Bhirithi Companion — Native Android application

This directory is the native Android implementation path for Bhirithi Companion. It is intentionally separate from the existing React/Vite web application.

## Android platform

- Application: Bhirithi Companion
- Package: `com.bhirithi.companion`
- Minimum Android: API 26
- Target Android: API 36
- Compile SDK: API 37
- UI: Jetpack Compose + Material 3
- Responsive layout: Material 3 Adaptive / Window Size Classes
- Architecture: UI → ViewModel → Repository → data source
- Offline direction: Room
- Current version: 0.1.0

The Android Developers documentation currently recommends the Compose BOM `2026.09.00`; current Android Studio Quail 4 supports AGP 9.4.x. citeturn0search0turn0search6turn0search8

## Build the APK

Open the **android** folder in Android Studio.

Or from a machine with JDK 17 and Gradle 9.6:

```bash
cd android
gradle :app:assembleDebug
```

The APK is produced at:

```
app/build/outputs/apk/debug/app-debug.apk
```

A GitHub Actions workflow is also included at `.github/workflows/android-build.yml` to build and upload the debug APK as an artifact.

## Current native scope

The native foundation already contains:

- Android application entry point
- Compose + Material 3 theme
- Light/dark theme support
- Adaptive navigation
- Panda / Study / Media / Yoga / Routine / Parents navigation
- ViewModel → Repository state boundary
- Room dependencies
- Android build configuration

The complete feature port is still in progress. The web application remains the current full-feature implementation until each feature is ported and tested natively.

## Required next native features

1. Panda chat connected to the existing server API.
2. Native SpeechRecognizer + Android TextToSpeech browser-voice equivalent.
3. Pipecat Android/WebRTC voice path with native TTS fallback.
4. Study Studio.
5. Learning TV & Web.
6. Yoga Studio + Yoga Radar.
7. Routine & Alarms.
8. Vibe & Parents.
9. Rescue Beacon.
10. Room persistence and offline synchronization.
11. Android runtime permission flows.
12. Accessibility and large-font verification.
13. Complete phone/tablet/landscape/dark-mode test matrix.

Do not declare the Android app production-ready until the validation sequence from the supplied Android development conditions has passed.


## Native feature-port status

The native Android app now includes:
- **Panda Chat** using the existing Vercel `/api/chat` backend, with conversation history sent through the Repository layer.
- **Panda voice input** using Android `SpeechRecognizer`, with microphone permission requested only when the user taps the mic.
- **Panda voice output** using Android `TextToSpeech`, preferring an `en-IN` voice when the device provides one, with a cheerful Panda rate/pitch profile.
- **Study, Yoga, Routine, Parents and Rescue** native navigation surfaces as the next feature-port destinations.
- Responsive navigation using Material 3 adaptive navigation and reusable Compose layouts.

The native voice implementation is an Android fallback/first native voice layer. The existing Pipecat prototype remains part of the web application; a production Pipecat Android realtime transport is not claimed as complete yet.

The native Android client calls the existing deployed backend over HTTPS. Gemini/API credentials remain server-side and are not placed in the APK.
