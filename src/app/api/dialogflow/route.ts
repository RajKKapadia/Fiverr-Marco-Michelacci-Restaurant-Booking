import { NextRequest, NextResponse } from 'next/server'

import {
    checkAvailableTables,
    checkWorkingHours,
    defaultWelcomeIntent,
    getFutureHolidays,
    addToBookings,
    addToWaitingList,
    getACallback,
    getBookingFromPhone,
    getBookingFromPhoneAndDate
} from '@/lib/dialogflow'
import { DetectIntentResponse } from '@/types'
import { generateDialogflowResponse } from '@/utils'

export async function GET(request: NextRequest) {
    return NextResponse.json({ status: 200, statusText: "OK" });
}

export async function POST(request: NextRequest) {
    const json = await request.json();
    console.log(JSON.stringify(json, null, 2));
    const { url, method } = request;
    try {
        const detectIntentResponse = json as DetectIntentResponse;
        const tag = detectIntentResponse.fulfillmentInfo.tag;
        console.log(`Tag: ${tag}`);
        let responseData = {};
        if (tag === "defaultWelcomeIntent") {
            responseData = await defaultWelcomeIntent(detectIntentResponse);
        } else if (tag === "checkWorkingHours") {
            responseData = await checkWorkingHours();
        } else if (tag === "getFutureHolidays") {
            responseData = await getFutureHolidays();
        } else if (tag === "checkAvailableTables") {
            responseData = await checkAvailableTables(detectIntentResponse);
        } else if (tag === 'addToBookings') {
            responseData = await addToBookings(detectIntentResponse);
        } else if (tag === 'addToWaitingList') {
            responseData = await addToWaitingList(detectIntentResponse);
        } else if (tag == 'getACallback') {
            responseData = await getACallback(detectIntentResponse);
        } else if (tag === "getBookingFromPhone") {
            responseData = await getBookingFromPhone(detectIntentResponse);
        } else if (tag === "getBookingFromPhoneAndDate") {
            responseData = await getBookingFromPhoneAndDate(detectIntentResponse);
        }
        else {
            responseData = generateDialogflowResponse(
                [`No handler for the tag ${tag}.`]
            );
        }
        return NextResponse.json(responseData, { status: 200, statusText: "OK" });
    } catch (error) {
        return NextResponse.json(
            { error: `Error at ${url}: Method: ${method}` },
            { status: 500 }
        )
    }
}