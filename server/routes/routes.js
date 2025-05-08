const jwt = require('jsonwebtoken');

const {verify, admin_verify} = require('../auth/verify');
const firestore = require('../database/config');


const router = require('express').Router()


router.get('/api/user', verify, (req, res) => {
    const token = req.query.token;
    const verifed = jwt.verify(token, process.env.TOKEN);
    const uid = verifed.id;
    const sid = req.query.sid

    const firestoreRef = firestore.collection("stores").doc(sid)

    firestoreRef.collection('users').doc(uid).get()
        .then(doc => {
            res.status(200).json({ success: true, user: { ...doc.data() } })
        }).catch(err => {
            res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
        })
})

router.get('/api/history', verify, (req, res) => {
    const token = req.query.token;
    const verifed = jwt.verify(token, process.env.TOKEN);
    const uid = verifed.id;
    const sid = req.query.sid

    const firestoreRef = firestore.collection("stores").doc(sid)

    firestoreRef.collection("users").doc(uid).collection("histories").orderBy("timestamp", "desc").get()
    .then(snap => {
        const data = []
        for(let x = 0; x < snap.docs.length; x++) {
            data.push({...snap.docs[x].data()})
        }
        res.status(200).json({ success: true, data: data })
    }).catch(err => {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    })
})

router.get('/api/admin/users', admin_verify, (req, res) => {
    const sid = req.query.sid

    const firestoreRef = firestore.collection("stores").doc(sid)

    firestoreRef.collection("users").orderBy("points", "desc").get()
    .then(snap => {
        const data = []
        for(let x = 0; x < snap.docs.length; x++) {
            data.push({...snap.docs[x].data()})
        }
        res.status(200).json({ success: true, data: data })
    }).catch(err => {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    })
})

router.get('/api/admin/user', admin_verify, (req, res) => {
    const uid = req.query.uid;
    const sid = req.query.sid

    const firestoreRef = firestore.collection("stores").doc(sid)

    firestoreRef.collection("users").doc(uid).get()
    .then(doc => {
        const data = doc.data()
        delete data["password"]
        res.status(200).json({ success: true, user: data })
    }).catch(err => {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    })

})

router.post('/api/admin/user/points', admin_verify, async (req, res) => {
    const token = req.query.token;
    const verifed = jwt.verify(token, process.env.ADMIN_TOKEN);
    const aid = verifed.id;
    const uid = req.query.uid;
    const sid = req.query.sid;
    const points = req.body.points
    const user_points = req.body.user_points
    const amount = req.body.amount

    const firestoreRef = firestore.collection("stores").doc(sid)

    // add points to user db 2. add points to user history 3. add points to points collections
    try {
        await firestoreRef.collection("users").doc(uid).update({
            points: user_points
        })
    
        await firestoreRef.collection("users").doc(uid).collection("histories").add({
            type: 'awarded',
            timestamp: Date.now(),
            by: aid,
            point: points,
            amount: amount
        })

        await firestoreRef.collection("points").add({
            timestamp: Date.now(),
            point: points,
            by: aid,
            to: uid,
            amount: amount,
            type: 'awarded'
        })

        res.status(200).json({ success: true })
    }catch(e){
        res.status(500).json({ success: false, error: e, msg: 'An error occured try again' });
    }
})

router.get("/api/admin/points", admin_verify, (req, res) => {
    const sid = req.query.sid;

    const firestoreRef = firestore.collection("stores").doc(sid)

    const yesterday = Date.now() - 24 * 60 * 60 * 1000;

    firestoreRef.collection("points").where('timestamp', ">", yesterday).get()
    .then(snap => {
        let docs = snap.docs
        let points = 0


        if(docs.length == 0)
            res.status(200).json({ success: true, points: points})
        else {
            for(let x = 0; x < docs.length; x++)
                points += docs[x].data().point

            res.status(200).json({ success: true, points: points})
        }

    }).catch(err => {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    })
})

router.get("/api/admin/user/redeem", admin_verify, async(req, res) => {
    const token = req.query.token;
    const verifed = jwt.verify(token, process.env.ADMIN_TOKEN);
    const aid = verifed.id;
    const sid = req.query.sid;
    const uid = req.query.uid

    const firestoreRef = firestore.collection("stores").doc(sid)

    let doc = await firestoreRef.collection("users").doc(uid).get()
    let points = doc.data().points

    // clear user's points
    await firestoreRef.collection("users").doc(uid).update({
        points: 0
    })

    // add action to user's history
    firestoreRef.collection("users").doc(uid).collection("histories").add({
        type: 'redeemed',
        timestamp: Date.now(),
        by: aid,
        point: points
    }).then(async() => {
        // add to points collection
        await firestoreRef.collection("points").add({
            type: 'redeemed',
            timestamp: Date.now(),
            by: aid,
            point: points,
            to: uid
        })
        res.status(200).json({ success: true})
    }).catch(err => {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    })
})

module.exports = router