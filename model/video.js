import mongoose from "mongoose"
const videoSchema = new mongoose.Schema(
    {
        tmdbId : Number,
        name : String,
        year : Number,
        subtitle : Array,
        list : String,
        url : String,
        baseUrl:String,
        type :String,
        season: {type : Number,default : 0},
        episode : {type : Number,default : 0},
        server : Number,
        subUrl : String,
        error : String,
        expireAt: { type: Date,expires: 3600}
    }
)

//videoSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });


export const VideoModel = new mongoose.model('video',videoSchema);