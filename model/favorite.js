import mongoose from "mongoose"

export const favSchema = new mongoose.Schema({
    tmdbId: String,
    userId: {type : String,ref : 'User'},
    type : String,
    name:String,
    release_date:Date,
    poster_path:String
});


export const Fav = new mongoose.model("favorite", favSchema);