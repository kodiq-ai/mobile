const { withMainApplication } = require('expo/config-plugins');

/**
 * Injects notification channel creation into MainApplication.kt onCreate().
 * Creates 4 channels: lessons, reminders, social, system.
 */
const withAndroidNotificationChannels = config => {
  return withMainApplication(config, mod => {
    let contents = mod.modResults.contents;

    // Add imports if not present
    if (!contents.includes('import android.app.NotificationChannel')) {
      contents = contents.replace(
        'import android.app.Application',
        `import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build`,
      );
    }

    // Add createNotificationChannels() call in onCreate
    if (!contents.includes('createNotificationChannels')) {
      contents = contents.replace(
        'super.onCreate()',
        `super.onCreate()
    createNotificationChannels()`,
      );

      // Add the method before the closing brace of the class
      contents = contents.replace(
        /(\n}\s*$)/,
        `

  private fun createNotificationChannels() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val manager = getSystemService(NotificationManager::class.java)
      manager.createNotificationChannels(listOf(
        NotificationChannel("lessons", "Уроки и модули", NotificationManager.IMPORTANCE_HIGH).apply {
          description = "Новые уроки, модули и обновления контента"
        },
        NotificationChannel("reminders", "Напоминания", NotificationManager.IMPORTANCE_DEFAULT).apply {
          description = "Streak, повторение, daily challenges"
        },
        NotificationChannel("social", "Социальное", NotificationManager.IMPORTANCE_LOW).apply {
          description = "Комментарии, peer review, лента"
        },
        NotificationChannel("system", "Системные", NotificationManager.IMPORTANCE_HIGH).apply {
          description = "Обновления приложения, обслуживание"
        },
      ))
    }
  }
$1`,
      );
    }

    mod.modResults.contents = contents;
    return mod;
  });
};

module.exports = withAndroidNotificationChannels;
