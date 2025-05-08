const express = require('express')
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const enforce = require('express-sslify');


const cors = require("cors")
const routes = require('./routes/routes')
const user_auth = require('./auth/user')
const admin_auth = require('./auth/admin')

// initialise express 
const app = express();

// initiallize dotenv
dotenv.config();

// initialize cross site origin
app.use(cors())

// port 
const PORT = process.env.PORT || 4040;

// MIDDLEWARE
app.use(enforce.HTTPS({ trustProtoHeader: true }))
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(express.json());
app.use(cookieParser());

app.use((_, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Method', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Origin')
    next();
})

// PATH
app.get("/", (req, res) => {
    res.send('Hello')
})

// API ROUTES
app.use(user_auth)
app.use(admin_auth)
app.use(routes)

// LISTENING
app.listen(PORT, () => console.log(`listening to port: ${PORT}`))