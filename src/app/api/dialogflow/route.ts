import { NextRequest, NextResponse } from 'next/server'

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

export async function GET() {
    return NextResponse.json({ status: 200, statusText: "OK" })
}

export async function POST(request: NextRequest) {
    const json = await request.json()
    const { url, method } = request
    try {
        const detectIntentResponse = json as DetectIntentResponse
        const tag = detectIntentResponse.fulfillmentInfo.tag
        console.log(`Tag: ${tag}`)
        let responseData = {}
        if (tag === "defaultWelcomeIntent") {
            responseData = await defaultWelcomeIntent(detectIntentResponse)
        } else if (tag === "checkWorkingHours") {
            responseData = await checkWorkingHours()
        } else if (tag === "getFutureHolidays") {
            responseData = await getFutureHolidays()
        } else if (tag === "checkAvailableTables") {
            responseData = await checkAvailableTables(detectIntentResponse)
        } else if (tag === 'addToBookings') {
            responseData = await addToBookings(detectIntentResponse)
        } else if (tag === 'addToWaitingList') {
            responseData = await addToWaitingList(detectIntentResponse)
        } else if (tag == 'addToCallback') {
            responseData = await addToCallback(detectIntentResponse)
        } else if (tag === "getBookingFromPhone") {
            responseData = await getBookingFromPhone(detectIntentResponse)
        } else if (tag === "invalidateBookingDate") {
            responseData = invalidateBookingDate(detectIntentResponse)
        } else if (tag === "getReservationFromParameter") {
            const tempData = await getReservationFromParameter(detectIntentResponse)
            if (tempData !== null) {
                responseData = tempData
            }
        } else if (tag === "cancellReservation") {
            responseData = cancellReservation(detectIntentResponse)
        } else if (tag === "updateBooking") {
            responseData = await updateBooking(detectIntentResponse)
        }
        else {
            responseData = generateDialogflowResponse(
                [`No handler for the tag ${tag}.`]
            )
        }
        return NextResponse.json(responseData, { status: 200, statusText: "OK" })
    } catch (error) {
        return NextResponse.json(
            { error: `Error at ${url}: Method: ${method} Error ${error}` },
            { status: 500 }
        )
    }
}
