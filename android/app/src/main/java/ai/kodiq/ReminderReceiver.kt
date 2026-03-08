package ai.kodiq

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat

class ReminderReceiver : BroadcastReceiver() {

    companion object {
        private const val CHANNEL_ID = "kodiq_reminders"
        private const val CHANNEL_NAME = "Напоминания о занятиях"
        private const val NOTIFICATION_ID = 9002
        private const val STREAK_PREFS = "kodiq_streak_data"
        private const val KEY_STREAK = "current_streak"
    }

    override fun onReceive(context: Context, intent: Intent) {
        createNotificationChannel(context)

        val launchIntent = context.packageManager.getLaunchIntentForPackage(context.packageName)
            ?.apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }

        val pendingIntent = PendingIntent.getActivity(
            context,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val body = buildNotificationBody(context)

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("Время учиться! \uD83D\uDCDA")
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun buildNotificationBody(context: Context): String {
        val prefs = context.getSharedPreferences(STREAK_PREFS, Context.MODE_PRIVATE)
        val streak = prefs.getInt(KEY_STREAK, 0)

        return when {
            streak >= 7 -> "Серия $streak дней! Не останавливайся \uD83D\uDD25"
            streak > 0 -> "Серия $streak дней. Продолжай учиться!"
            else -> "Начни сегодня и построй серию занятий!"
        }
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Ежедневные напоминания о занятиях"
            }

            val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }
}
