import { WaitingList, DetectIntentResponse, DialogflowResponse } from "@/types";
import { generateDialogflowResponse, getBookingDateAndtime } from "@/utils";
import { addWaitingList } from "@/lib/firebase";

export const addToWaitingList = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const bookingDateAndtime = getBookingDateAndtime(detectIntentResponse);
        let newWaitingList: WaitingList = {
            bookingDate: bookingDateAndtime.bookingDate,
            bookingTime: bookingDateAndtime.bookingTime,
            name: parameters.waitingListName,
            partySize: 4,
            phone: parameters.waitingListPhone,
            duration: "",
            status: "pending"
        };
        console.log(newWaitingList);
        const flag = await addWaitingList(newWaitingList, parameters.restaurantId);
        if (flag) {
            return generateDialogflowResponse(
                ["WaitingList saved."]
            );
        } else {
            return generateDialogflowResponse(
                ["WaitingList not saved."]
            );
        }
    } catch (error) {
        console.error('Error at saveToBookings:', error);
        return generateDialogflowResponse(
            ["The restaurant is closed at this point for unknown reasons."]
        );
    }
}
