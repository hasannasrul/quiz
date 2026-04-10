import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

export async function ensurePushPermissions() {
    const settings = await Notifications.getPermissionsAsync();
    if (settings.status === 'granted') return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.status === 'granted';
}

export async function scheduleDailyQuizReminder() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
        content: {
            title: 'Quiz App',
            body: 'Daily quiz is ready. Keep your streak alive!',
        },
        trigger: {
            hour: 9,
            minute: 0,
            repeats: true,
        },
    });
}
