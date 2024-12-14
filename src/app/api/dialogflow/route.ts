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
        if (tag === "defaultWelcomeIntent") {
            const responseData = await defaultWelcomeIntent(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "checkWorkingHours") {
            const responseData = await checkWorkingHours()
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "getFutureHolidays") {
            const responseData = await getFutureHolidays()
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "checkAvailableTables") {
            const responseData = await checkAvailableTables(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === 'addToBookings') {
            const responseData = await addToBookings(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === 'addToWaitingList') {
            const responseData = await addToWaitingList(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag == 'addToCallback') {
            const responseData = await addToCallback(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "getBookingFromPhone") {
            const responseData = await getBookingFromPhone(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "invalidateBookingDate") {
            const responseData = invalidateBookingDate(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "getReservationFromParameter") {
            const tempData = await getReservationFromParameter(detectIntentResponse)
            if (tempData !== null) {
                const responseData = tempData
                return NextResponse.json(responseData, { status: 200, statusText: "OK" })
            }
        } else if (tag === "cancellReservation") {
            const responseData = cancellReservation(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else if (tag === "updateBooking") {
            const responseData = await updateBooking(detectIntentResponse)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        }
        else {
            const responseData = generateDialogflowResponse(
                [`No handler for the tag ${tag}.`]
            )
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        }
    } catch (error) {
        return NextResponse.json(
            { error: `Error at ${url}: Method: ${method} Error ${error}` },
            { status: 500 }
        )
    }
}
