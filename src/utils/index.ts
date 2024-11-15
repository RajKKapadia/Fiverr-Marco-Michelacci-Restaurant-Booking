import { formatInTimeZone } from "date-fns-tz";
import { BookingDateAndTime, DetectIntentResponse, DialogflowMessage, DialogflowResponse, SessionInfo } from "@/types";
import { TIMEZONE } from "@/config/constants";

export const generateDialogflowResponse = (messages?: string[], sessionInfo?: SessionInfo): DialogflowResponse => {
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
    return dialogflowResponse;
};

export const getCurrentDayOfWeek = (): string => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    console.log(currentDate);
    console.log(new Date(formatInTimeZone(currentDate, TIMEZONE, 'dd/MM/yyyy')));
    const currentDayIndex = new Date(formatInTimeZone(currentDate, TIMEZONE, 'dd/MM/yyyy')).getDay();
    console.log(currentDayIndex);
    return daysOfWeek[currentDayIndex];
};

export const getBookingOfWeekFromDate = (dateStr: string): string => {
    const [day, month, year] = dateStr.split('/').map(Number);
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date(year, month - 1, day);
    const currentDayIndex = new Date(formatInTimeZone(currentDate, TIMEZONE, 'dd/MM/yyyy')).getDay();
    return daysOfWeek[currentDayIndex];
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
    console.log('Parameters:', parameters);

    const day = parameters.bookingdate.day;
    const month = parameters.bookingdate.month;
    const year = parameters.bookingdate.year;
    const hours = parameters.bookingtime.hours;
    const minutes = parameters.bookingtime.minutes;

    console.log(`Date: ${day}/${month}/${year}`);
    console.log(`Time: ${hours}:${minutes}`);

    const bookingDate = formatInTimeZone(new Date(year, month - 1, day), TIMEZONE, 'dd/MM/yyyy');
    console.log('Booking Date:', bookingDate);

    const bookingDateTime = new Date(Date.UTC(year, month - 1, day, hours - 1, minutes, 0));
    const bookingTime = formatInTimeZone(bookingDateTime, TIMEZONE, 'HH:mm');
    console.log('Booking Time:', bookingTime);

    const bookingDay = getBookingOfWeekFromDate(bookingDate);
    const currentDay = getCurrentDayOfWeek();

    const newBookingDateAndTime: BookingDateAndTime = {
        bookingDay: "bookingDay",
        currentDay: "currentDay",
        bookingDate: bookingDate,
        bookingTime: bookingTime
    }
    return newBookingDateAndTime;
}