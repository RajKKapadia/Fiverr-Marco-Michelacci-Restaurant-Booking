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
    const currentDayIndex = new Date(formatInTimeZone(currentDate, TIMEZONE, 'dd/MM/yyyy')).getDay();
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
    const day = parameters.bookingDate.day;
    const month = parameters.bookingDate.month;
    const year = parameters.bookingDate.year;
    const hours = parameters.bookingTime.hours;
    const minutes = parameters.bookingTime.minutes;
    const bookingDate = new Date(`${day}/${month + 1}/${year}`).toLocaleDateString("en-US", { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: TIMEZONE });
    const bookingTime = new Date(Date.UTC(year, month + 1, day, hours, minutes, 0)).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIMEZONE });
    const currentDay = getCurrentDayOfWeek();
    const bookingDay = getBookingOfWeekFromDate(bookingDate);

    const newBookingDateAndTime: BookingDateAndTime = {
        bookingDay: bookingDay,
        currentDay: currentDay,
        bookingDate: bookingDate,
        bookingTime: bookingTime
    }
    return newBookingDateAndTime;
}
