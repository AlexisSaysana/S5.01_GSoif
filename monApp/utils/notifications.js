import * as Notifications from 'expo-notifications';

export async function scheduleHydrationNotification(intervalleMinutes, message) {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Hydratation 💧",
        body: message,
      },
      trigger: {
        seconds: intervalleMinutes * 60,
        repeats: true,
      },
    });

    console.log("🔔 Notification programmée toutes les", intervalleMinutes, "minutes");
  } catch (error) {
    console.log("❌ Erreur programmation notification :", error);
  }
}
