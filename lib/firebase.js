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
          privateKey: privateKey,
        }),
      });
      console.log('Firebase Admin initialized successfully');
    } catch (error) {
      if (error.code === 'app/duplicate-app') {
        firebaseApp = admin.app();
      } else {
        console.error('Firebase Admin init error:', error.message);
      }
    }
  }
  return firebaseApp;
}

// Send push notification to a single device
export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    const app = getFirebaseAdmin();
    if (!app) return { success: false, error: 'Firebase not initialized' };

    const message = {
      notification: { title, body },
      data: data || {},
      token: fcmToken,
    };

    const result = await admin.messaging(app).send(message);
    return { success: true, messageId: result };
  } catch (error) {
    console.error('Push notification error:', error.message);
    return { success: false, error: error.message };
  }
}

// Send push notification to multiple devices
export async function sendMulticastNotification(fcmTokens, title, body, data = {}) {
  try {
    const app = getFirebaseAdmin();
    if (!app) return { success: false, error: 'Firebase not initialized' };

    if (!fcmTokens || fcmTokens.length === 0) {
      return { success: false, error: 'No FCM tokens provided' };
    }

    const message = {
      notification: { title, body },
      data: data || {},
      tokens: fcmTokens,
    };

    const result = await admin.messaging(app).sendEachForMulticast(message);
    return {
      success: true,
      successCount: result.successCount,
      failureCount: result.failureCount,
      responses: result.responses,
    };
  } catch (error) {
    console.error('Multicast notification error:', error.message);
    return { success: false, error: error.message };
  }
}

// Send notification to a topic
export async function sendTopicNotification(topic, title, body, data = {}) {
  try {
    const app = getFirebaseAdmin();
    if (!app) return { success: false, error: 'Firebase not initialized' };

    const message = {
      notification: { title, body },
      data: data || {},
      topic: topic,
    };

    const result = await admin.messaging(app).send(message);
    return { success: true, messageId: result };
  } catch (error) {
    console.error('Topic notification error:', error.message);
    return { success: false, error: error.message };
  }
}
