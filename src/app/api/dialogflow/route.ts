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

// Validation function for DetectIntentResponse
function isValidDetectIntentResponse(data: any): data is DetectIntentResponse {
    // Check for required top-level properties
    return (
        typeof data === 'object' &&
        data !== null &&
        typeof data.detectIntentResponseId === 'string' &&
        data.intentInfo && typeof data.intentInfo.lastMatchedIntent === 'string' &&
        data.pageInfo && typeof data.pageInfo.currentPage === 'string' &&
        data.sessionInfo && typeof data.sessionInfo.session === 'string' &&
        data.fulfillmentInfo && typeof data.fulfillmentInfo.tag === 'string'
    )
}

export async function GET() {
    return NextResponse.json({ status: 200, statusText: "OK" })
}

export async function POST(request: NextRequest) {
    try {
        // Log complete request details for debugging
        console.log('Full Request Details:', {
            method: request.method,
            url: request.url,
            headers: Object.fromEntries(request.headers)
        })

        // Attempt to parse JSON with comprehensive error handling
        let json;
        try {
            const rawText = await request.text();
            console.log('Raw Request Body:', rawText);

            try {
                json = JSON.parse(rawText);
            } catch (parseError) {
                console.error('JSON Parsing Error:', parseError);
                return NextResponse.json(
                    {
                        error: 'Invalid JSON',
                        rawBody: rawText,
                        details: parseError instanceof Error ? parseError.message : String(parseError)
                    },
                    { status: 400 }
                );
            }
        } catch (readError) {
            console.error('Request Body Read Error:', readError);
            return NextResponse.json(
                {
                    error: 'Unable to read request body',
                    details: readError instanceof Error ? readError.message : String(readError)
                },
                { status: 400 }
            );
        }

        // Validate the parsed JSON against our expected interface
        if (!isValidDetectIntentResponse(json)) {
            console.error('Invalid DetectIntentResponse structure', json);
            return NextResponse.json(
                {
                    error: 'Invalid request structure',
                    receivedStructure: Object.keys(json)
                },
                { status: 400 }
            );
        }

        const { url, method } = request
        const tag = json.fulfillmentInfo.tag
        console.log(`Processing tag: ${tag}`)

        const handlerMap: Record<string, (response: DetectIntentResponse) => Promise<any> | any> = {
            defaultWelcomeIntent: defaultWelcomeIntent,
            checkWorkingHours: checkWorkingHours,
            getFutureHolidays: getFutureHolidays,
            checkAvailableTables: checkAvailableTables,
            addToBookings: addToBookings,
            addToWaitingList: addToWaitingList,
            addToCallback: addToCallback,
            getBookingFromPhone: getBookingFromPhone,
            invalidateBookingDate: invalidateBookingDate,
            getReservationFromParameter: getReservationFromParameter,
            cancellReservation: cancellReservation,
            updateBooking: updateBooking
        }

        const handler = handlerMap[tag]

        if (handler) {
            const responseData = await (typeof handler === 'function' ? handler(json) : handler)
            return NextResponse.json(responseData, { status: 200, statusText: "OK" })
        } else {
            const responseData = generateDialogflowResponse(
                [`No handler found for tag: ${tag}`]
            )
            return NextResponse.json(responseData, { status: 404, statusText: "Not Found" })
        }
    } catch (error) {
        console.error('Unhandled error in route handler:', error);
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500, statusText: "Internal Server Error" }
        )
    }
}

// Explicitly export route handlers
export const dynamic = 'force-dynamic'
export const revalidate = 0
