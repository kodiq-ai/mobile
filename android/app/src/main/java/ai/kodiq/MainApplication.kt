package ai.kodiq

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          add(StreakWidgetPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    createNotificationChannel()
  }

  private fun createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)

      val channels = listOf(
        NotificationChannel(
          "lessons",
          "Уроки и модули",
          NotificationManager.IMPORTANCE_HIGH
        ).apply { description = "Новые уроки, модули и обновления контента" },

        NotificationChannel(
          "reminders",
          "Напоминания",
          NotificationManager.IMPORTANCE_DEFAULT
        ).apply { description = "Streak, повторение, daily challenges" },

        NotificationChannel(
          "social",
          "Социальное",
          NotificationManager.IMPORTANCE_LOW
        ).apply { description = "Комментарии, peer review, лента" },

        NotificationChannel(
          "system",
          "Системные",
          NotificationManager.IMPORTANCE_HIGH
        ).apply { description = "Обновления приложения, обслуживание" },
      )

      manager.createNotificationChannels(channels)

      // Remove legacy channel
      manager.deleteNotificationChannel("kodiq_academy")
    }
  }
}
