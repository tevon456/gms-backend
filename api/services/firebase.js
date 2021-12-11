const admin = require("firebase-admin");

// get credentials from base64 encoded service account json stored in environment json
const serviceAccount = JSON.parse(
  Buffer.from(process.env.GOOGLE_CONFIG_BASE64, "base64").toString("ascii")
);

// initialize firebase admin with credentials
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const auth = admin.auth();
const storage = admin.storage();

module.exports = {
  db,
  auth,
  storage,
  admin,
};
