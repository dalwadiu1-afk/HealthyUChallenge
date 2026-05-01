const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
const data = require('./data.jS');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

async function importData() {
  // USERS
  const users = data.users;
  for (const userId in users) {
    await db.collection('users').doc(userId).set(users[userId]);
    console.log(`Imported user ${userId}`);
  }

  // DOCTORS
  const doctors = data.doctors;
  for (const docId in doctors) {
    await db.collection('doctors').doc(docId).set(doctors[docId]);
    console.log(`Imported doctor ${docId}`);
  }
}

importData();
