import {
    checkAvailableTables,
    checkWorkingHours,
    defaultWelcomeIntent,
    getFutureHolidays,
    addToBookings,
    addToWaitingList,
    addToCallback,
    getBookingFromPhone,
    invalidateBookingDate,
    getReservationFromParameter,
    cancellReservation,
    updateBooking
} from '@/lib/dialogflow'
import { DetectIntentResponse } from '@/types'
import { generateDialogflowResponse } from '@/utils'
import { ERROR_MESSAGE } from '@/config/constants'

export async function GET() {
    return Response.json({ status: 200, statusText: "OK" })
}

export async function POST(request: Request) {
    const { url, method } = request
    const payload = await request.json()
    if (payload === undefined) {
        return Response.json(
            { error: `Error at ${url}: Method: ${method}` },
            { status: 500 }
        )
    }
    try {
        const detectIntentResponse = payload as DetectIntentResponse
        console.log(detectIntentResponse)
        const tag = detectIntentResponse.fulfillmentInfo.tag
        console.log(`Tag: ${tag}`)
        if (tag === "defaultWelcomeIntent") {
            const responseData = await defaultWelcomeIntent(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "checkWorkingHours") {
            const responseData = await checkWorkingHours()
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "getFutureHolidays") {
            const responseData = await getFutureHolidays()
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "checkAvailableTables") {
            const responseData = await checkAvailableTables(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === 'addToBookings') {
            const responseData = await addToBookings(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === 'addToWaitingList') {
            const responseData = await addToWaitingList(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag == 'addToCallback') {
            const responseData = await addToCallback(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "getBookingFromPhone") {
            const responseData = await getBookingFromPhone(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "invalidateBookingDate") {
            const responseData = invalidateBookingDate(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "getReservationFromParameter") {
            const tempData = await getReservationFromParameter(detectIntentResponse)
            if (tempData !== null) {
                const responseData = tempData
                return Response.json(responseData, { status: 200, statusText: "OK" })
            } else {
                const responseData = generateDialogflowResponse(
                    [ERROR_MESSAGE]
                )
                return Response.json(responseData, { status: 200, statusText: "OK" })
            }
        } else if (tag === "cancellReservation") {
            const responseData = cancellReservation(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "updateBooking") {
            const responseData = await updateBooking(detectIntentResponse)
            return Response.json(responseData, { status: 200, statusText: "OK" })
        }
        else {
            const responseData = generateDialogflowResponse(
                [`No handler for the tag ${tag}.`]
            )
            return Response.json(responseData, { status: 200, statusText: "OK" })
        }
    } catch (error) {
        return Response.json(
            { error: `Error at ${url}: Method: ${method} Error ${error}` },
            { status: 500 }
        )
    }
}
