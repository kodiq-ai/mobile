# ProGuard rules for Kodiq Mobile (React Native 0.84 + Hermes)
# ============================================================

# --- React Native Framework ---
# Keep the bridge: JS calls Java via reflection
-keep,allowobfuscation class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.modules.** { *; }
-keepclassmembers class * extends com.facebook.react.bridge.ReactContextBaseJavaModule {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# ViewManagers registered by name
-keepclassmembers class * extends com.facebook.react.uimanager.ViewManager {
    public <init>(***);
}

# --- Hermes Engine ---
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Firebase (Analytics, Crashlytics, Messaging) ---
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.android.gms.**

# Crashlytics needs unobfuscated stack traces
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception

# --- Google Sign-In ---
-keep class com.google.android.gms.auth.** { *; }
-keep class com.google.android.gms.common.** { *; }

# --- OkHttp (networking layer) ---
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-keepnames class okhttp3.internal.publicsuffix.PublicSuffixDatabase

# --- Sentry (crash reporting) ---
-keep class io.sentry.** { *; }
-dontwarn io.sentry.**
-keepattributes Signature

# --- React Native WebView ---
-keep class com.reactnativecommunity.webview.** { *; }

# --- General Android ---
-keepattributes *Annotation*
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable implementations
-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

# Keep enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}
