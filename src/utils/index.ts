import { format, formatInTimeZone } from "date-fns-tz";
import { BookingDateAndTime, DetectIntentResponse, DialogflowMessage, DialogflowResponse, PageInfo, SessionInfo } from "@/types";
import { TIMEZONE } from "@/config/constants";

export const generateDialogflowResponse = (messages?: string[], sessionInfo?: SessionInfo, pageInfo?: PageInfo): DialogflowResponse => {
    let dialogflowResponse: DialogflowResponse = {};
    if (messages) {
        const formattedMessages: DialogflowMessage[] = messages.map(text => ({
            text: {
                text: [text],
                redactedText: [text]
            },
            responseType: "RESPONSE_TYPE_UNSPECIFIED",
        }));
        dialogflowResponse.fulfillmentResponse = {
            messages: formattedMessages
        };
    }
    if (sessionInfo) {
        dialogflowResponse.sessionInfo = sessionInfo;
    }
    if (pageInfo) {
        dialogflowResponse.pageInfo = pageInfo;
    }
    return dialogflowResponse;
};

export const getCurrentDayOfWeek = (): string => {
    const currentDay = formatInTimeZone(new Date(), TIMEZONE, "EEEE");
    return currentDay;
};

export const getBookingOfWeekFromDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const utcBookingDate = new Date(year, month - 1, day);
    const bookingDay = format(utcBookingDate, "EEEE");
    return bookingDay;
};

export const isTimeWithinRange = (time: string, startTime: string, endTime: string): boolean => {
    if (!time || !startTime || !endTime) {
        console.error('Invalid time parameters:', { time, startTime, endTime });
        return false;
    }
    try {
        const [hours, minutes] = time.split(':').map(Number);
        const [startHours, startMinutes] = startTime.split(':').map(Number);
        const [endHours, endMinutes] = endTime.split(':').map(Number);
        if (isNaN(hours) || isNaN(minutes) ||
            isNaN(startHours) || isNaN(startMinutes) ||
            isNaN(endHours) || isNaN(endMinutes)) {
            console.error('Invalid time format:', { time, startTime, endTime });
            return false;
        }
        const timeValue = hours * 60 + minutes;
        const startValue = startHours * 60 + startMinutes;
        const endValue = endHours * 60 + endMinutes;
        return timeValue >= startValue && timeValue <= endValue;
    } catch (error) {
        console.error('Error parsing time:', error);
        return false;
    }
};

export const getBookingDateAndtime = (detectIntentResponse: DetectIntentResponse): BookingDateAndTime => {
    const parameters = detectIntentResponse.sessionInfo.parameters;
    const day = parameters.bookingdate.day;
    const month = parameters.bookingdate.month;
    const year = parameters.bookingdate.year;
    const hours = parameters.bookingtime.hours;
    const minutes = parameters.bookingtime.minutes;
    const utcBookingDate = new Date(year, month - 1, day, hours, minutes, 0);
    const bookingDate = format(utcBookingDate, "dd/MM/yyyy");
    const bookingDay = format(utcBookingDate, "EEEE");
    const bookingTime = format(utcBookingDate, "HH:mm");
    const currentDay = formatInTimeZone(new Date(), TIMEZONE, "EEEE");
    return {
        bookingDate: bookingDate,
        bookingDay: bookingDay,
        bookingTime: bookingTime,
        currentDay: currentDay
    };
}
