import { Bookings, DetectIntentResponse, DialogflowResponse } from "@/types";
import { generateDialogflowResponse, getBookingDateAndtime } from "@/utils";
import { addBookings } from "@/lib/firebase";

export const addToBookings = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const bookingDateAndtime = getBookingDateAndtime(detectIntentResponse);
        let newBooking: Bookings = {
            customerEmail: parameters.email,
            customerName: parameters.name.name,
            customerPhone: parameters.phone,
            date: bookingDateAndtime.bookingDate,
            duration: parameters.duration,
            partySize: 4,
            endTime: "",
            specialRequests: "",
            startTime: "",
            status: "pending"
        };
        const flag = await addBookings(newBooking, parameters.restaurantId);
        if (flag) {
            return generateDialogflowResponse(
                ["Booking saved."]
            );
        } else {
            return generateDialogflowResponse(
                ["Booking not saved."]
            );
        }
    } catch (error) {
        console.error('Error at saveToBookings:', error);
        return generateDialogflowResponse(
            ["The restaurant is closed at this point for unknown reasons."]
        );
    }
}
