import mongoose from "mongoose"

export const roomSchema = new mongoose.Schema({
    tmdbId: Number,
    userId: {type : String,ref : 'User'},
    type : String,
    episode : {type : Number,default : 0},
    season : {type : Number,default : 0},
    password : {type : String,default : ''},
    open: {type:Boolean,default:true},
    expireAt: { type: Date,expires: 3600*24,default: new Date()}
});

//roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 10 });

export const Room = new mongoose.model("room", roomSchema);