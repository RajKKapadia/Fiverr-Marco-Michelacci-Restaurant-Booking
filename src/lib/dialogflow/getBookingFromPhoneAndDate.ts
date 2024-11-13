import { DetectIntentResponse, DialogflowResponse } from "@/types";
import { generateDialogflowResponse } from "@/utils";
import { findBookingByCustomerPhoneAndBookingDate } from "@/lib/firebase";

export const getBookingFromPhoneAndDate = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const bookingDate = "";
        const bookings = await findBookingByCustomerPhoneAndBookingDate(parameters.customerPhone, bookingDate, parameters.restaurantNumber);
        if (bookings) {
            return generateDialogflowResponse(
                [`The booking with the phone number ${parameters.customerPhone} found.`],
                {
                    session: detectIntentResponse.sessionInfo.session,
                    parameters: {
                        foundBookingAgain: "YES",
                        booking: bookings.data[0]
                    }
                }
            );
        } else {
            return generateDialogflowResponse(
                [`The booking with the phone number ${parameters.customerPhone} not found.`],
                {
                    session: detectIntentResponse.sessionInfo.session,
                    parameters: {
                        foundBookingAgain: "NO"
                    }
                }
            );
        }
    } catch (error) {
        console.error('Error at saveToBookings:', error);
        return generateDialogflowResponse(
            ["The restaurant is closed at this point for unknown reasons."]
        );
    }
}
