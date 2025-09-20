import { sendWithMrsool } from "./mrsool";
import { sendWithCareem } from "./careem";
import { sendWithNinja } from "./Ninja";

export type DeliveryProvider = "mrsool" | "careem" | "ninja";

export interface DeliveryRequest {
  pickup: string;          // عنوان الاستلام
  dropoff: string;         // عنوان التوصيل
  description?: string;
  customerPhone: string;
  amount: number;          // قيمة الطلب (يمكن استخدامها لـ COD)
  provider: DeliveryProvider;
}

export interface DeliveryResponse {
  success: boolean;
  trackingId?: string;
  trackingUrl?: string;
  error?: string;
}

export async function createDelivery(
  request: DeliveryRequest
): Promise<DeliveryResponse> {
  try {
    switch (request.provider) {
      case "mrsool":
        return await sendWithMrsool(request);
      case "careem":
        return await sendWithCareem(request);
      case "ninja":
        return await sendWithNinja(request);
      default:
        return { success: false, error: "مزود التوصيل غير مدعوم" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
