import { Callback, DetectIntentResponse, DialogflowResponse } from "@/types";
import { generateDialogflowResponse, getBookingDateAndtime } from "@/utils";
import { addCallback } from "@/lib/firebase";
import { format } from "date-fns";

export const getACallback = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const day = parameters.callbackdate.day;
        const month = parameters.callbackdate.month;
        const year = parameters.callbackdate.year;
        const utcBookingDate = new Date(year, month - 1, day, 0, 0, 0);
        const callbackDate = format(utcBookingDate, "dd/MM/yyyy");
        let newCallback: Callback = {
            callbackDate: callbackDate,
            callbackTime: "ANYTIME",
            name: parameters.callbackname.name,
            phone: parameters.callbackphone,
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
        console.error('Error at getACallback:', error);
        return generateDialogflowResponse(
            ["The restaurant is closed at this point for unknown reasons."]
        );
    }
}
