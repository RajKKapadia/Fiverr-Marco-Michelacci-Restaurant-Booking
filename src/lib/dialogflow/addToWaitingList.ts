import { WaitingList, DetectIntentResponse, DialogflowResponse } from "@/types"
import { capitalizeFirstLetter, generateDialogflowResponse, getBookingDateAndtime } from "@/utils"
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
        let day, month, year, hours, minutes = 0
        if (parameters.BOOKING_CHANGED) {
            day = parameters.new_booking_date.day as number
            month = parameters.new_booking_date.month as number
            year = parameters.new_booking_date.year as number
            hours = parameters.new_booking_time.hours as number
            minutes = parameters.new_booking_time.minutes as number
        } else {
            day = parameters.booking_date.day as number
            month = parameters.booking_date.month as number
            year = parameters.booking_date.year as number
            hours = parameters.booking_time.hours as number
            minutes = parameters.booking_time.minutes as number
        }
        if (day === 0) {
            return generateDialogflowResponse(
                [ERROR_MESSAGE]
            )
        }
        const { bookingDate, bookingTime } = getBookingDateAndtime({ day: day, month: month - 1, year: year, hours: hours, minutes: minutes })
        const newWaitingList: WaitingList = {
            bookingDate: bookingDate,
            bookingTime: bookingTime,
            name: capitalizeFirstLetter(parameters.waitinglist_name.name),
            partySize: 4,
            phone: parameters.waitinglist_phone,
            duration: "",
            status: "pending"
        }
        const newWaitingListInfo = await addWaitingList({ waitingList: newWaitingList, restaurantId: parameters.restaurantId })
        console.log(newWaitingListInfo.id)
        if (newWaitingListInfo.status) {
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
