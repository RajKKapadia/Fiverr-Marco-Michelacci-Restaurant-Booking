import { Bookings, DetectIntentResponse, DialogflowResponse } from "@/types"
import { calculateStartAndEndTime, capitalizeFirstLetter, generateDialogflowResponse, getBookingDateAndtime, getFiveUniqueRandomNumbers } from "@/utils"
import { addBookings } from "@/lib/firebase"
import { ERROR_MESSAGE } from "@/config/constants"

export const addToBookings = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
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
        const { startTime, endTime } = calculateStartAndEndTime({ startTime: bookingTime, duration: parameters.duration })
        const reservationNumber = getFiveUniqueRandomNumbers()
        const newBooking: Bookings = {
            reservationNumber: reservationNumber,
            customerEmail: parameters.email,
            customerName: capitalizeFirstLetter(parameters.name.name),
            customerPhone: parameters.phone,
            date: bookingDate,
            duration: parameters.duration,
            partySize: 4,
            endTime: endTime,
            specialRequests: {
                tableType: parameters.table_type || "",
                allergy: parameters.allergy || "",
                speciaOccassion: parameters.specia_occassion || ""
            },
            startTime: startTime,
            status: "pending"
        }
        const newBookingInfo = await addBookings({ booking: newBooking, restaurantId: parameters.restaurantId })
        console.log(newBookingInfo.id)
        if (newBookingInfo.status) {
            return generateDialogflowResponse(
                ["Booking saved.", `Your reservation number is ${reservationNumber}.`]
            )
        } else {
            return generateDialogflowResponse(
                ["Booking not saved."]
            )
        }
    } catch (error) {
        console.error('Error at saveToBookings:', error)
        return generateDialogflowResponse(
            [ERROR_MESSAGE]
        )
    }
}
