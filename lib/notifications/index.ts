import { sendFirebaseNotification } from "./firebase";
import { sendSMS } from "./sms";

export type NotificationChannel = "firebase" | "sms";

export interface NotificationRequest {
  title: string;
  body: string;
  recipient: string; // userId لـ Firebase أو رقم جوال لـ SMS
  channel: NotificationChannel;
  data?: Record<string, any>;
}

export interface NotificationResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendNotification(
  request: NotificationRequest
): Promise<NotificationResponse> {
  try {
    switch (request.channel) {
      case "firebase":
        return await sendFirebaseNotification(request);
      case "sms":
        return await sendSMS(request);
      default:
        return { success: false, error: "قناة الإشعار غير مدعومة" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
