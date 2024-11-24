import { WaitingList, DetectIntentResponse, DialogflowResponse } from "@/types"
import { generateDialogflowResponse, getBookingDateAndtime } from "@/utils"
import { addWaitingList } from "@/lib/firebase"
import { ERROR_MESSAGE } from "@/config/constants"

export const addToWaitingList = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const parameters = detectIntentResponse.sessionInfo.parameters
        if (parameters == null) {
            return generateDialogflowResponse(
                [ERROR_MESSAGE]
            )
        }
        const day = parameters.booking_date.day as number || parameters.new_booking_date.day as number
        const month = parameters.booking_date.month as number || parameters.new_booking_date.month as number
        const year = parameters.booking_date.year as number || parameters.new_booking_date.year as number
        const hours = parameters.booking_time.hours as number || parameters.new_booking_time.hours as number
        const minutes = parameters.booking_time.minutes as number || parameters.new_booking_time.minutes as number
        const { bookingDate, bookingTime } = getBookingDateAndtime({ day: day, month: month - 1, year: year, hours: hours, minutes: minutes })
        const newWaitingList: WaitingList = {
            bookingDate: bookingDate,
            bookingTime: bookingTime,
            name: parameters.waitingListName,
            partySize: 4,
            phone: parameters.waitingListPhone,
            duration: "",
            status: "pending"
        }
        console.log(newWaitingList)
        const flag = await addWaitingList({ waitingList: newWaitingList, restaurantId: parameters.restaurantId })
        if (flag) {
            return generateDialogflowResponse(
                ["WaitingList saved."]
            )
        } else {
            return generateDialogflowResponse(
                ["WaitingList not saved."]
            )
        }
    } catch (error) {
        console.error('Error at saveToBookings:', error)
        return generateDialogflowResponse(
            [ERROR_MESSAGE]
        )
    }
}
