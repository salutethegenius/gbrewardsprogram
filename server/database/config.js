var admin = require("firebase-admin");

var serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://bijouxterner-loyalty.appspot.com"
});

const firestore = admin.app().firestore();


module.exports = firestore;