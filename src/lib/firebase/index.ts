import { NextRequest } from "next/server";

import { Availability, Bookings, Callback, Restaurant, WaitingList } from "@/types";
import { db } from "@/lib/firebase/admin";

const restaurantCollectionName = "test_restaurants";
const bookingsCollectionName = "bookings";
const availabilityCollectionName = "availability";
const waitingListCollectionName = "waitingList";
const callbackRequestsCollectionName = "callbackRequests";
const customersCollectionName = "customers";

export const findRestaurantByPhone = async (restaurantNumber: string): Promise<{ data: Restaurant, id: string } | null> => {
    const restaurantSnapshot = await db.collection(restaurantCollectionName).where("phone", "==", restaurantNumber).limit(1).get();
    if (!restaurantSnapshot.empty) {
        const restaurant = restaurantSnapshot.docs[0].data() as Restaurant;
        return {
            data: restaurant,
            id: restaurantSnapshot.docs[0].id
        };
    }
    return null;
};

export const findAvailabilityByRestaurantPhoneAndDate = async (restaurantNumber: string, date: string): Promise<{ data: Availability, id: string } | null> => {
    const restaurantSnapshot = await db.collection(restaurantCollectionName).where("phone", "==", restaurantNumber).limit(1).get();
    if (!restaurantSnapshot.empty) {
        const restaurant = restaurantSnapshot.docs[0];
        const availabilitySnapshot = await db.collection(restaurantCollectionName)
            .doc(restaurant.id)
            .collection(availabilityCollectionName)
            .where('date', '==', date)
            .limit(1)
            .get();
        if (!availabilitySnapshot.empty) {
            const restaurant = availabilitySnapshot.docs[0].data() as Availability;
            return {
                data: restaurant,
                id: availabilitySnapshot.docs[0].id
            };
        } else {
            return null;
        }
    }
    return null;
};

export const findBookingsByRestaurantPhoneAndDate = async (restaurantNumber: string, date: string): Promise<{ data: Bookings[] } | null> => {
    const restaurantSnapshot = await db.collection(restaurantCollectionName).where("phone", "==", restaurantNumber).limit(1).get();
    if (!restaurantSnapshot.empty) {
        const restaurant = restaurantSnapshot.docs[0];
        const bookingsSnapshot = await db.collection(restaurantCollectionName)
            .doc(restaurant.id)
            .collection(bookingsCollectionName)
            .where('date', '==', date)
            .get();
        if (!bookingsSnapshot.empty) {
            const bookings = bookingsSnapshot.docs.map(doc => ({
                ...doc.data()
            })) as Bookings[];

            return {
                data: bookings
            };
        } else {
            return null;
        }
    }
    return null;
}

export const addBookings = async (booking: Bookings, restaurantId: string): Promise<boolean> => {
    try {
        const restaurantRef = db.collection(restaurantCollectionName).doc(restaurantId);
        const bookingsRef = restaurantRef.collection(bookingsCollectionName);
        await bookingsRef.add(booking);
        return true;
    } catch (error) {
        console.error('Error saving booking data:', error);
        return false;
    }
}

export const addWaitingList = async (waitingList: WaitingList, restaurantId: string): Promise<boolean> => {
    try {
        const restaurantRef = db.collection(restaurantCollectionName).doc(restaurantId);
        const waitingListRef = restaurantRef.collection(waitingListCollectionName);
        await waitingListRef.add(waitingList);
        return true;
    } catch (error) {
        console.error('Error saving waiting list data:', error);
        return false;
    }
}

export const addCallback = async (callback: Callback, restaurantId: string): Promise<boolean> => {
    try {
        const restaurantRef = db.collection(restaurantCollectionName).doc(restaurantId);
        const callbackRef = restaurantRef.collection(callbackRequestsCollectionName);
        await callbackRef.add(callback);
        return true;
    } catch (error) {
        console.error('Error saving callback data:', error);
        return false;
    }
}

export const findBookingByCustomerPhone = async (customerPhone: string, restaurantNumber: string): Promise<{ data: Bookings[] } | null> => {
    const restaurantSnapshot = await db.collection(restaurantCollectionName).where("phone", "==", restaurantNumber).limit(1).get();
    if (!restaurantSnapshot.empty) {
        const restaurant = restaurantSnapshot.docs[0];
        const bookingsSnapshot = await db.collection(restaurantCollectionName)
            .doc(restaurant.id)
            .collection(bookingsCollectionName)
            .where('customerPhone', '==', customerPhone)
            .get();
        if (!bookingsSnapshot.empty) {
            const bookings = bookingsSnapshot.docs.map(doc => ({
                ...doc.data()
            })) as Bookings[];
            return {
                data: bookings
            };
        } else {
            return null;
        }
    }
    return null;
}

export const findBookingByCustomerPhoneAndBookingDate = async (customerPhone: string, bookingDate: string, restaurantNumber: string): Promise<{ data: Bookings[] } | null> => {
    const restaurantSnapshot = await db.collection(restaurantCollectionName).where("phone", "==", restaurantNumber).limit(1).get();
    if (!restaurantSnapshot.empty) {
        const restaurant = restaurantSnapshot.docs[0];
        const bookingsSnapshot = await db.collection(restaurantCollectionName)
            .doc(restaurant.id)
            .collection(bookingsCollectionName)
            .where("customerPhone", "==", customerPhone)
            .where("date", "==", bookingDate)
            .get();
        if (!bookingsSnapshot.empty) {
            const bookings = bookingsSnapshot.docs.map(doc => ({
                ...doc.data()
            })) as Bookings[];
            return {
                data: bookings
            };
        } else {
            return null;
        }
    }
    return null;
}
