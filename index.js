import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import express from "express";
import mongoose from "mongoose"
import session from 'express-session'
import passport from 'passport'
import passportLocal from 'passport-local';
import { User } from "./model/user.js";
import connectMongo from 'connect-mongo';
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { createServer } from "http";
import rateLimit from 'express-rate-limit'
const MongoStore = connectMongo(session);

//MongoDB connection
await mongoose.connect("mongodb://127.0.0.1/fraka")
.then(async()=>{console.log('Database connected ✔');}).catch(err => {throw err;});

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 170, // Limit each IP to 100 requests per minute
});

//express app
const app = express();
app.use(express.static('dist'));
const httpServer =  createServer(app);
app.use(limiter);
app.use(cookieParser());
app.set('trust proxy', true);
app.set('trust proxy', process.env.SERVERIP);
function isLocalNetworkOrigin(origin) {
  if (origin && origin.startsWith('http://192.168.1.')) {
    return true;
  }
  return false;
}
const allowedOrigins = ['http://localhost:5173',process.env.SERVERURL,`${process.env.SERVERURL}:4000`,`${process.env.SERVERURL}:80`,`${process.env.SERVERURL}:8080`]; // Add the origins you want to allow

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || isLocalNetworkOrigin(origin) || !origin ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow credentials (cookies)
};

// Use the CORS middleware with the specified options
app.use(cors(corsOptions));
//app.use((req,res,next)=>{console.log(req.headers.cookie);res.clearCookie('user_token');next();})
app.use(express.json());
///////passport
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    name:"jkqwetw",
    cookie: {
        maxAge: 1000* 60* 60 * 24 * 30, // Set session expiration time to mounth hour (in milliseconds)
        secure :false,
        httpOnly:true
    },
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}))
app.use(passport.initialize());
app.use(passport.session());



passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
////


httpServer.listen(4000,()=>{console.log("Server Started ✔");});
app.use(express.json());

//routers
import { movieRouter } from "./routers/movie.js";
import { tvshowRouter } from "./routers/tv.js";
import { personRouter } from "./routers/person.js";
import { combineRouter } from "./routers/combine.js";
import { accountRouter } from "./routers/account.js";
import { favoriteRouter } from "./routers/favorite.js";
import { continouoRouter } from "./routers/continou.js";
import { roomRouting } from "./routers/room.js";
import { videoRouter } from "./routers/video.js";
import { subRouter } from "./routers/subtitle.js";
import { saveContinouWatch } from "./controller/continou.js";
import socketScript from "./controller/socketHandler.js";

//use
socketScript(httpServer);
app.use(saveContinouWatch);
app.use('/movie',movieRouter);
app.use('/tv',tvshowRouter);
app.use('/person',personRouter);
app.use('/all',combineRouter);
app.use('/account',accountRouter);
app.use('/fav',favoriteRouter);
app.use('/con',continouoRouter);
app.use('/room',roomRouting);
app.use('/video',videoRouter);
app.use('/subtitle',subRouter);

app.get('/ping',(req,res)=>{
  res.status(200).json({result:'done'});
})

app.use(function(req, res, next) {
  res.sendFile(__dirname+'/dist/index.html');
    //res.status(404).json({error:"_Resource not found."})
});