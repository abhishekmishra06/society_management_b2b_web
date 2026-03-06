import admin from 'firebase-admin';

let firebaseApp = null;

export function getFirebaseAdmin() {
  if (!firebaseApp) {
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey,
        }),
      });
      console.log('[Firebase] Admin SDK initialized');
    } catch (error) {
      if (error.code === 'app/duplicate-app') firebaseApp = admin.app();
      else console.error('[Firebase] Init error:', error.message);
    }
  }
  return firebaseApp;
}

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    const app = getFirebaseAdmin();
    if (!app) return { success: false, error: 'Firebase not initialized' };
    const result = await admin.messaging(app).send({ notification: { title, body }, data, token: fcmToken });
    return { success: true, messageId: result };
  } catch (error) { return { success: false, error: error.message }; }
}

export async function sendMulticastNotification(tokens, title, body, data = {}) {
  try {
    const app = getFirebaseAdmin();
    if (!app || !tokens?.length) return { success: false, error: 'No tokens' };
    const result = await admin.messaging(app).sendEachForMulticast({ notification: { title, body }, data, tokens });
    return { success: true, successCount: result.successCount, failureCount: result.failureCount };
  } catch (error) { return { success: false, error: error.message }; }
}
