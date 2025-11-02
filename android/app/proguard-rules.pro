# ===============================================
# 📘 PROJECT-SPECIFIC PROGUARD RULES (React Native)
# ===============================================

# ------------------------------------------------
# 1. React Native Core – keep all required classes
# ------------------------------------------------
-keep class com.facebook.react.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.views.text.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }
-keepclassmembers class * {
    @com.facebook.react.bridge.ReactMethod <methods>;
}

# ------------------------------------------------
# 2. Prevent text / font rendering being stripped
#    ✅ Fixes invisible placeholder & typed text on Android AAB
# ------------------------------------------------
-keep class android.widget.TextView { *; }
-keep class android.widget.EditText { *; }
-keep class com.facebook.react.views.textinput.ReactEditText { *; }
-keep class com.facebook.react.views.textinput.ReactTextInputManager { *; }

# ------------------------------------------------
# 3. Reanimated (React Native Reanimated 2+)
# ------------------------------------------------
-keep class com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**

# ------------------------------------------------
# 4. Hermes (JS engine)
# ------------------------------------------------
-keep class com.facebook.hermes.** { *; }
-dontwarn com.facebook.hermes.**

# ------------------------------------------------
# 5. Expo & React Native TurboModules
# ------------------------------------------------
-keep class expo.modules.** { *; }
-keep class com.facebook.react.turbomodule.** { *; }

# ------------------------------------------------
# 6. Prevent stripping of @Keep annotated items
# ------------------------------------------------
-keep,allowobfuscation @interface androidx.annotation.Keep
-keep @androidx.annotation.Keep class * { *; }
-keepclassmembers class * {
    @androidx.annotation.Keep *;
}

# ------------------------------------------------
# 7. Common libraries
# ------------------------------------------------
-dontwarn com.facebook.react.**
-dontwarn com.facebook.jni.**
-dontwarn okio.**
-dontwarn javax.annotation.**

# ------------------------------------------------
# 8. Gson / JSON serialization (if used)
# ------------------------------------------------
-keep class com.google.gson.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

# ------------------------------------------------
# 9. Networking & OkHttp (if used)
# ------------------------------------------------
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# ------------------------------------------------
# 10. Miscellaneous safety
# ------------------------------------------------
-dontwarn sun.misc.**
-dontwarn java.lang.invoke.*
-dontwarn org.codehaus.mojo.animal_sniffer.IgnoreJRERequirement
-dontwarn kotlinx.coroutines.**

# ------------------------------------------------
# 11. React Native Gesture Handler / Modal etc.
# ------------------------------------------------
-keep class com.swmansion.gesturehandler.** { *; }
-keep class com.swmansion.rnscreens.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# ------------------------------------------------
# 12. Final safety overrides
# ------------------------------------------------
-keepclassmembers class * {
    public <init>(...);
}
