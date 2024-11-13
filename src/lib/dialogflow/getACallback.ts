import { Callback, DetectIntentResponse, DialogflowResponse } from "@/types";
import { generateDialogflowResponse, getBookingDateAndtime } from "@/utils";
import { addCallback } from "@/lib/firebase";

export const getACallback = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const bookingDateAndtime = getBookingDateAndtime(detectIntentResponse);
        let newCallback: Callback = {
            callbackDate: "",
            callbackTime: "",
            name: parameters.callbackName,
            phone: parameters.callbackPhone,
            status: "pending"
        };
        const flag = await addCallback(newCallback, parameters.restaurantId);
        if (flag) {
            return generateDialogflowResponse(
                ["Callback saved."]
            );
        } else {
            return generateDialogflowResponse(
                ["Callback not saved."]
            );
        }
    } catch (error) {
        console.error('Error at saveToBookings:', error);
        return generateDialogflowResponse(
            ["The restaurant is closed at this point for unknown reasons."]
        );
    }
}
