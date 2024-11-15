import { NextRequest } from "next/server"
import { DetectIntentResponse, DialogflowResponse, WeeklyOperatingHours, Slot, Availability } from "@/types"
import { ERROR_MESSAGE, TIMEZONE, DIALOGFLOW_FLAGS } from "@/config/constants"
import { findAvailabilityByRestaurantPhoneAndDate, findBookingsByRestaurantPhoneAndDate, findRestaurantByPhone } from "@/lib/firebase"
import { generateDialogflowResponse, getBookingDateAndtime, getCurrentDayOfWeek, isTimeWithinRange } from "@/utils"

export const checkAvailableTables = async (detectIntentResponse: DetectIntentResponse): Promise<DialogflowResponse> => {
    try {
        const session = detectIntentResponse.sessionInfo.session;
        const parameters = detectIntentResponse.sessionInfo.parameters;
        const restaurantNumber = parameters.restaurantNumber;
        const partySize = parameters.partysize;
        const { currentDay, bookingDate, bookingTime } = getBookingDateAndtime(detectIntentResponse);
        const restaurant = await findRestaurantByPhone(restaurantNumber);
        if (restaurant) {
            const { id: restaurantId, data: restaurantData } = restaurant;

            // 1. Check for holiday
            const isHoliday = restaurantData.holidays.some(holiday => holiday.date === bookingDate);
            if (isHoliday) {
                return generateDialogflowResponse(
                    [
                        "There is no slot available for reservation today beacuase of a holiday.",
                        "Do you want to choose anothe date and time?"
                    ],
                    {
                        session: session,
                        parameters: {
                            bookingStatus: DIALOGFLOW_FLAGS.NO_BOOKING
                        }
                    }
                );
            }

            // 2. Check if there's a special event
            const hasSpecialEvent = restaurantData.specialEvents.some(event =>
                event.date === bookingDate && event.requiresReservation === true
            );
            if (hasSpecialEvent) {
                return generateDialogflowResponse(
                    [
                        "There is no slot available for reservation today beacuase of a special event.",
                        "Do you want to choose anothe date and time?"
                    ],
                    {
                        session: session,
                        parameters: {
                            bookingStatus: DIALOGFLOW_FLAGS.NO_BOOKING
                        }
                    }
                );
            }

            // 3. Check if the restaurant is open on this day
            const operatingHours = restaurantData.operatingHours[currentDay as keyof WeeklyOperatingHours];
            console.log(operatingHours);
            if (!operatingHours) {
                return generateDialogflowResponse(
                    [
                        `Restaurant is not available for reservation at ${bookingTime} on ${bookingDate}.`,
                        "Do you want to choose anothe date and time?"
                    ],
                    {
                        session: session,
                        parameters: {
                            bookingStatus: DIALOGFLOW_FLAGS.NO_BOOKING
                        }
                    }
                );
            }

            // 4. Get availability for the date
            const availability = await findAvailabilityByRestaurantPhoneAndDate(restaurantNumber, bookingDate);
            if (!availability) {
                return generateDialogflowResponse(
                    [
                        `Restaurant is not available for reservation at ${bookingTime} on ${bookingDate}.`,
                        "Do you want to choose anothe date and time?"
                    ],
                    {
                        session: session,
                        parameters: {
                            bookingStatus: DIALOGFLOW_FLAGS.NO_BOOKING
                        }
                    }
                );
            }
            const { id: availabilityId, data: availabilityData } = availability;

            console.log(availabilityId);

            // Get the existing bookings for the booking date
            const existingBookings = await findBookingsByRestaurantPhoneAndDate(restaurantNumber, bookingDate);
            let alreadyBookedSeats = 0;
            existingBookings?.data.forEach(data => {
                if (data.status === 'confirmed') {
                    alreadyBookedSeats += data.partySize;
                }
            });

            // 5. Check all-day reservation if enabled
            const { bookingStartTime, bookingEndTime, availableSeats } = availabilityData.accpetAllDayReservation;
            if (availabilityData.accpetAllDayReservation.status) {
                if (!isTimeWithinRange(bookingTime, bookingStartTime, bookingEndTime)) {
                    return generateDialogflowResponse(
                        [
                            `Booking is only available between ${bookingStartTime} and ${bookingEndTime}.`,
                            "Do you want to choose anothe date and time?"
                        ],
                        {
                            session: session,
                            parameters: {
                                bookingStatus: DIALOGFLOW_FLAGS.NO_BOOKING
                            }
                        }
                    );
                }

                if ((availableSeats - alreadyBookedSeats) < partySize) {
                    return generateDialogflowResponse(
                        [
                            `Not enough seats avaialable for the date ${bookingDate} at ${bookingTime}.`,
                            "Do you want to choose anothe date and time?"
                        ],
                        {
                            session: session,
                            parameters: {
                                bookingStatus: DIALOGFLOW_FLAGS.NO_BOOKING
                            }
                        }
                    );
                }

                return generateDialogflowResponse(
                    undefined,
                    {
                        session: session,
                        parameters: {
                            bookingStatus: DIALOGFLOW_FLAGS.YES,
                            duration: availabilityData.accpetAllDayReservation.duration
                        }
                    }
                );
            }

            // 6. Check lunch and dinner slots
            let availableTimeSlots: Slot[] = [];
            const lunchData = availabilityData.lunch
            if (lunchData) {
                // Add a small amount of logic to update the availableSeats depending on the alreadyBookedSeats
                const matchingSlots = lunchData.timeSlots.filter(slot => {
                    return isTimeWithinRange(bookingTime, slot.bookingStartTime, slot.bookingEndTime) &&
                        (slot.availableSeats - alreadyBookedSeats) >= partySize;
                });
                availableTimeSlots = [...availableTimeSlots, ...matchingSlots];
            }
            const dinnerData = availabilityData.lunch
            if (dinnerData) {
                // Add a small amount of logic to update the availableSeats depending on the alreadyBookedSeats
                const matchingSlots = dinnerData.timeSlots.filter(slot => {
                    return isTimeWithinRange(bookingTime, slot.bookingStartTime, slot.bookingEndTime) &&
                        (slot.availableSeats - alreadyBookedSeats) >= partySize;
                });
                availableTimeSlots = [...availableTimeSlots, ...matchingSlots];
            }
            availableTimeSlots.forEach(timeSlot => {
                timeSlot.availableSeats = timeSlot.availableSeats - alreadyBookedSeats
            });

            if (availableTimeSlots.length === 0) {
                const allSlots = availabilityData.lunch.timeSlots.concat(availabilityData.dinner.timeSlots).map(slot => slot);

                return generateDialogflowResponse(
                    [`Not enough seats avaialable for the date ${bookingDate} at ${bookingTime}.`,],
                    {
                        session: session,
                        parameters: {
                            bookingStatus: DIALOGFLOW_FLAGS.NO,
                            availableTimeSlots: allSlots
                        }
                    }
                );
            }

            return generateDialogflowResponse(
                undefined,
                {
                    session: session,
                    parameters: {
                        bookingStatus: DIALOGFLOW_FLAGS.YES,
                        availableTimeSlots: availableTimeSlots,
                        duration: availableTimeSlots[0].duration
                    }
                }
            );

        } else {
            console.error('Restaurant not found in Firestore.');
            return generateDialogflowResponse(
                ['The restaurant is closed at this point for unknown reasons.']
            );
        }
    } catch (error) {
        console.error('Error checking restaurant status:', error);
        return generateDialogflowResponse(
            [ERROR_MESSAGE]
        );
    }
}
