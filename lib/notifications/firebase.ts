import admin from "firebase-admin";
import { NotificationRequest, NotificationResponse } from "./index";

// لازم تجهز مفاتيح Firebase Admin SDK في متغيرات البيئة
// GOOGLE_APPLICATION_CREDENTIALS أو JSON من Firebase Console

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

export async function sendFirebaseNotification(
  request: NotificationRequest
): Promise<NotificationResponse> {
  try {
    const message = {
      notification: {
        title: request.title,
        body: request.body,
      },
      data: request.data || {},
      token: request.recipient, // لازم ترسل FCM token الخاص بالجهاز
    };

    const response = await admin.messaging().send(message);
    return { success: true, messageId: response };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
