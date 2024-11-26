import admin from "firebase-admin"

const FIREBASE_CREDENTIALS = JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CREDENTIALS as string)

function getFirebaseAdmin() {
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: FIREBASE_CREDENTIALS.project_id,
                clientEmail: FIREBASE_CREDENTIALS.client_email,
                privateKey: FIREBASE_CREDENTIALS.private_key
            }),
            databaseURL: "https://restaurant_bookings.firebaseio.com"
        })
    }
    return admin
}

export const db = getFirebaseAdmin().firestore()
