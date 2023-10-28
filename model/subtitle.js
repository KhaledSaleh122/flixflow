import mongoose from "mongoose"

export const subtitleSchema = new mongoose.Schema({
    tmdbId: Number,
    type : String,
    episode : {type : Number,default : 0},
    season : {type : Number,default : 0},
    data : Object,
    lang:String
});


export const Sub = new mongoose.model("subtitle", subtitleSchema);