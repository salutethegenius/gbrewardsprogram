const router = require('express').Router()
const joi = require('joi');
const jwt = require('jsonwebtoken');
const firestore = require('../database/config');
const bcrypt = require('bcrypt');
const v4 = require("uuid").v4()

// loginschema
const loginSchema = joi.object({
    email: joi.string().min(5).required().email(),
    password: joi.string().min(8).required()
});

const registerSchema = joi.object({
    email: joi.string().min(5).required().email(),
    password: joi.string().min(8).required(),
    fullname: joi.string().min(5).required(),
    phone: joi.number().min(6).required(),
    company: joi.string().min(1)
})


router.post('/api/admin/signin', (req, res) => {
    const api_token = req.query.api_token
    const sid = req.query.sid


    if (api_token) {
        if (api_token !== process.env.API_TOKEN) {
            res.status(401).json({ success: false, msg: 'Invalid api token', error: 'unauthorised request' })
            return
        }
    }

    const firestoreRef = firestore.collection("stores").doc(sid)


    try {
        loginSchema.validateAsync(req.body)
            .then(val => {
                // check that email exists 
                firestoreRef.collection('admins').where('email', '==', val.email).get()
                    .then(snap => {
                        if (snap.docs.length > 0) {
                            // email exists
                            // compare pssword
                            bcrypt.compare(val.password, snap.docs[0].data().password, async (err, result) => {
                                if (result) {
                                    // create token
                                    const token = jwt.sign({ id: snap.docs[0].id }, process.env.ADMIN_TOKEN);
                                    // send some user dets back
                                    let user = snap.docs[0].data()
                                    delete user["password"]
                                    res.status(200).json({ success: true, admin: user, token: token });
                                } else {
                                    res.status(401).json({ success: false, error: 'Password Mismatch', msg: 'Invalid password' });
                                }
                            })

                        } else {
                            res.status(401).json({ success: false, error: "invalid Email", msg: 'No email record available' });
                        }
                    }).catch(err => {
                        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
                    })
            }).catch(err => {
                res.status(401).json({ success: false, error: err, msg: 'An error occured while trying to proccess data' });
            })
    } catch (err) {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    }
})

router.post('/api/admin/signup', (req, res) => {
    const api_token = req.query.api_token
    const sid = req.query.sid


    if (api_token) {
        if (api_token !== process.env.API_TOKEN) {
            res.status(401).json({ success: false, msg: 'Invalid api token', error: 'unauthorised request' })
            return
        }
    }

    const firestoreRef = firestore.collection("stores").doc(sid)
    const data = req.body;
    
    try {
        registerSchema.validateAsync(data)
            .then(val => {
                // check if email exists
                firestoreRef.collection('admins').where('email', '==', val.email).get()
                    .then(snap => {
                        if (snap.docs.length == 0) {
                            bcrypt.hash(val.password, 10, (err, hash) => {
                                if (err) {
                                    res.status(500).json({ success: false, error: err, msg: 'An error occured while registering user' });
                                    return
                                }

                                const aid = v4
                                delete data["password"]

                                firestoreRef.collection('admins').doc(aid).set({
                                    ...data,
                                    id: aid,
                                    password: hash,
                                    timestamp: Date.now()
                                }).then(docRef => {
                                    const token = jwt.sign({ id: docRef.id }, process.env.ADMIN_TOKEN);
                                    const user = {
                                        ...data, id: aid,
                                    }
                                    res.status(200).json({ success: true, admin: user, token: token });
                                }).catch(err => {
                                    res.status(500).json({ success: false, error: err, msg: 'An error occured while registering user' });
                                })
                            })
                        } else {
                            res.status(401).json({ success: false, error: 'Email Exists', msg: 'Email exists in database' });
                        }
                    }).catch(err => {
                        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
                    })
            }).catch(err => {
                console.log(err)
                res.status(401).json({ success: false, error: err, msg: 'An error occured while verifying data' });
            })
    } catch (err) {
        res.status(500).json({ success: false, error: err, msg: 'An error occured from the server' });
    }
})

module.exports = router