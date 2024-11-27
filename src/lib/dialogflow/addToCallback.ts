import { Callback, DetectIntentResponse, DialogflowResponse } from "@/types"
import { capitalizeFirstLetter, generateDialogflowResponse, getBookingDate } from "@/utils"
import { addCallback } from "@/lib/firebase"
import { ERROR_MESSAGE } from "@/config/constants"

export const addToCallback = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters
        if (parameters == null) {
            return generateDialogflowResponse(
                [ERROR_MESSAGE]
            )
        }
        const day = parameters.callback_date.day as number
        const month = parameters.callback_date.month as number
        const year = parameters.callback_date.year as number
        const { bookingDate: callbackDate } = getBookingDate({ day: day, month: month - 1, year: year })
        const newCallback: Callback = {
            callbackDate: callbackDate,
            callbackTime: parameters.callback_time,
            name: capitalizeFirstLetter(parameters.callback_name.name),
            phone: parameters.callback_phone,
            reason: parameters.callback_reason,
            status: "pending",
        }
        const flag = await addCallback({ callback: newCallback, restaurantId: parameters.restaurantId })
        if (flag) {
            return generateDialogflowResponse(
                ["Callback saved."]
            )
        } else {
            return generateDialogflowResponse(
                ["Callback not saved."]
            )
        }
    } catch (error) {
        console.error('Error at addToCallback:', error)
        return generateDialogflowResponse(
            [ERROR_MESSAGE]
        )
    }
}
