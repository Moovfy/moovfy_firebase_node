const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});


exports.newMessageNotification = functions.database.ref('/messages/{roomID}/{messageID}')
    .onWrite((change,context) => {
        console.log("NEW MESSAGE NOTIFICATION");
        var roomID = context.params.roomID;
        const message = change.after.val();
        const senderID = message.senderUid;
        var arr = roomID.split("|");
        var uid = "";
        if (senderID === arr[0]) {
            uid = arr[1]
        }
        else {
            uid = arr[0]
        }
        admin.database().ref('/users/' + uid).once('value').then(function(snapshot) {
            var token = snapshot.val().token;
            var message2 = {
                android: {
                    ttl: 3600 * 1000, // 1 hour in milliseconds
                    priority: 'normal',
                    notification: {
                        title: senderID,
                        body: message.message,
                        icon: '',
                        color: '#f45342'
                    }
                },
                token: token
            };

            admin.messaging().send(message2)
                .then((response) => {
                    // Response is a message ID string.
                    console.log('Successfully sent message:', response);
                })
                .catch((error) => {
                    console.log('Error sending message:', error);
                });

        });
    });