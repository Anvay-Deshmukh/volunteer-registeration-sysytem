/**
 * Run this ONCE to set a user as admin.
 * Sets BOTH Firestore role AND Firebase Custom Claim.
 * Usage: node scripts/setAdmin.js <email>
 */

require('dotenv').config({ path: '../.env' });
const admin = require('firebase-admin');
const serviceAccount = require('../firebase-credentials.json');

if (!admin.apps.length) {
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
}

const db   = admin.firestore();
const auth = admin.auth();

async function setAdmin(email) {
  if (!email) { console.error('Usage: node setAdmin.js <email>'); process.exit(1); }

  try {
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    console.log(`Found user: ${uid}`);

    // 1️⃣ Set Firebase Custom Claim (baked into ID token — bypasses Firestore rules)
    await auth.setCustomUserClaims(uid, { role: 'admin' });
    console.log('✅ Custom claim set: { role: "admin" }');

    // 2️⃣ Also update Firestore users collection
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();
    if (userDoc.exists) {
      await userRef.update({ role: 'admin' });
    } else {
      await userRef.set({
        email,
        displayName: userRecord.displayName || email.split('@')[0],
        role: 'admin',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    console.log('✅ Firestore role updated: admin');
    console.log('\n🎉 Done! Log OUT and log back in to get the updated token.\n');
    process.exit(0);
  } catch (err) {
    if (err.code === 'auth/user-not-found') {
      console.error(`❌ No user found with email: ${email}`);
    } else {
      console.error('❌ Error:', err.message);
    }
    process.exit(1);
  }
}

setAdmin(process.argv[2]);
