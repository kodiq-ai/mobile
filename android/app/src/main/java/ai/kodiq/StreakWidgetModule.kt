package ai.kodiq

import android.content.Context
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class StreakWidgetModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "StreakWidget"

    @ReactMethod
    fun updateStreak(streak: Int, challengeDone: Boolean, promise: Promise) {
        try {
            val prefs = reactApplicationContext.getSharedPreferences(
                "ai.kodiq.widget",
                Context.MODE_PRIVATE
            )
            prefs.edit()
                .putInt("streak_count", streak)
                .putBoolean("challenge_done", challengeDone)
                .apply()

            StreakWidgetProvider.updateAllWidgets(reactApplicationContext)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("WIDGET_ERROR", e.message)
        }
    }

    @ReactMethod
    fun updateExtended(streak: Double, done: Boolean, progress: Double, lessonTitle: String?) {
        val prefs = reactApplicationContext.getSharedPreferences(
            "ai.kodiq.widget",
            Context.MODE_PRIVATE
        )
        prefs.edit()
            .putInt("streak_count", streak.toInt())
            .putBoolean("challenge_done", done)
            .putInt("progress", progress.toInt())
            .putString("lesson_title", lessonTitle ?: "")
            .apply()

        StreakWidgetProvider.updateAllWidgets(reactApplicationContext)
    }
}
