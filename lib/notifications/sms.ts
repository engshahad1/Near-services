import { NotificationRequest, NotificationResponse } from "./index";

// ⚠️ Placeholder: تحتاج تستخدم مزود SMS (Twilio, Unifonic, STC, إلخ)
export async function sendSMS(
  request: NotificationRequest
): Promise<NotificationResponse> {
  try {
    // نحاكي إرسال SMS
    console.log(`إرسال SMS إلى ${request.recipient}: ${request.body}`);

    const fakeMessageId = `SMS-${Date.now()}`;
    return { success: true, messageId: fakeMessageId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
