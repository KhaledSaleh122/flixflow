import mongoose from "mongoose"

export const conSchema = new mongoose.Schema({
    tmdbId: String,
    userId: {type : String,ref : 'User'},
    type : String,
    time : {type : Number,default : 0},
    episode : {type : Number,default : 0},
    season : {type : Number,default : 0},
    name: String,
    poster_path:String
});


export const Con = new mongoose.model("continou", conSchema);