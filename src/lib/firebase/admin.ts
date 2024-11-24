import admin from "firebase-admin"

import { ENV } from "@/utils/env"

function getFirebaseAdmin() {
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: ENV.FIREBASE_CREDENTIALS.project_id,
                clientEmail: ENV.FIREBASE_CREDENTIALS.client_email,
                privateKey: ENV.FIREBASE_CREDENTIALS.private_key
            }),
            databaseURL: "https://restaurant_bookings.firebaseio.com"
        })
    }
    return admin
}

export const db = getFirebaseAdmin().firestore()
