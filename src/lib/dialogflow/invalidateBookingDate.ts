const { compareAsc } = require("date-fns");

import { Bookings, DetectIntentResponse, DialogflowResponse } from "@/types";
import { generateDialogflowResponse, getBookingDateAndtime } from "@/utils";
import { addBookings } from "@/lib/firebase";

export const invalidateBookingDate = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse | null> => {
    try {
        console.log("I am here...");
        console.log(JSON.stringify(detectIntentResponse, null, 2));
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const day = parameters.bookingdate.day;
        const month = parameters.bookingdate.month;
        const year = parameters.bookingdate.year;
        const flag = compareAsc(new Date(year, month - 1, day), new Date());
        if (flag === -1) {
            return generateDialogflowResponse(
                ["You have provided a past date for the reservation."],
                undefined,
                {
                    currentPage: detectIntentResponse.pageInfo.currentPage,
                    displayName: detectIntentResponse.pageInfo.displayName,
                    formInfo: {
                        parameterInfo: [
                            {
                                displayName: "bookingdate",
                                required: true,
                                state: "INVALID"
                            }
                        ]
                    }
                }
            )
        }
        return null;
    } catch (error) {
        console.error('Error at invalidateBookingDate:', error);
        return generateDialogflowResponse(
            ["The restaurant is closed at this point for unknown reasons."]
        );
    }
}