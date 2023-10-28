import mongoose from "mongoose"
import passportLocalMongoose from 'passport-local-mongoose';
import passport from 'passport'

export const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    admin : {type : Boolean,default : false},
    subtitle:{type : String,default : 'english'},
    credit : {type:Number,default:30},
    vip : {type:Boolean,default:false}
});


userSchema.plugin(passportLocalMongoose);

export const User = new mongoose.model("account", userSchema);


passport.use(User.createStrategy());