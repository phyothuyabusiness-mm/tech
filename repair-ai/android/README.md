# PTY-TECH Repair AI — Android APK source

This Android Studio project bundles the offline fault guide as a local asset. It does not alter the existing PTY-TECH Repair Management website or Supabase.

## Build APK

1. Download this repository ZIP from GitHub, or clone the repository.
2. In Android Studio choose **Open** and select the `repair-ai/android` folder.
3. Use JDK 17 and allow Gradle sync to finish. Install Android SDK Platform 35 if Android Studio asks.
4. Connect an Android phone with USB debugging enabled, or start an emulator, then press **Run** to test.
5. To create an APK: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
6. The debug APK is normally created at `app/build/outputs/apk/debug/app-debug.apk`.

Minimum Android version: Android 6.0 (API 23). The offline guide is bundled. Online AI works after entering the deployed secure backend URL in the app and requires internet.

## Files still needed

Copy the current `repair-ai/index.html` into:
`app/src/main/assets/repair-ai/index.html`

Keep that copy synchronized whenever the web version is updated. This folder in GitHub is a source project, not a compiled APK; APK compilation must run in Android Studio.
