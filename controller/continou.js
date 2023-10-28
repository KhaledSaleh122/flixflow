import createHttpError from "http-errors";
import dotenv from 'dotenv'
dotenv.config();
import { Con } from "../model/continou.js";
import { getMovieById } from "./movie.js";
import { getTvShowById } from "./tv.js";
import mongoose from "mongoose";
export async function addContinouWatch(req, res) {
    try {
        const newCon = await Con.findOneAndUpdate({tmdbId : req.body.id,userId : req.params.id},
            {
                episode : (req.body.episode),
                season : (req.body.season),
                time : req.body.time,
                type : req.body.type,
                name: (req.tmdbData.original_title || req.tmdbData.original_name),
                poster_path: req.tmdbData.poster_path
            },
            {
                upsert: true,
                new: true
            }
        ).exec();
        if(!newCon){throw 'Could not complete.'}
        res.status(200).json(newCon);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export async function saveContinouWatch(req, res,next) {
    try {
        if(req.isAuthenticated() && req.cookies.con){
            const continou = JSON.parse(req.cookies.con);
            if(Array.isArray(continou) && continou.length > 0){
                continou.forEach(async(v,i)=>{
                    if(
                        typeof v === "object" && 
                        !isNaN(Number(v.id)) && !isNaN(Number(v.episode)) && !isNaN(Number(v.season)) && !isNaN(Number(v.time)) &&
                        (v.type === "tv" || v.type === "movie")
                    ){
                        //console.log(v);
                        const tmdbData = (v.type ==="movie" ? await getMovieById(Number(v.id)):await getTvShowById(Number(v.id)));
                        if(tmdbData && Number(tmdbData.id)){
                            await Con.findOneAndUpdate({
                                tmdbId: v.id,userId:req.user._id,
                                $or:[{episode:{$lte:v.episode},season:v.season},{season:{$lt:v.season}}]
                            },
                            {
                                episode:v.episode,
                                season :v.season,
                                time:v.time,
                                type:v.type,
                                name: tmdbData.name || tmdbData.title,
                                poster_path:tmdbData.poster_path
                            },
                            {
                                upsert: true,
                                new: true
                            }
                            )
                        }
                    }
                })
            }
            res.clearCookie('con');
        }
        next();
    } catch (err) {
        res.clearCookie('con');
        console.log(err);
        next();
    }
}

export async function getContinousWatching(req, res) {
    try {
        const Cons = await Con.find({});
        res.status(200).json(Cons);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getUserContinouWatching(req, res) {
    try {
        const con = await Con.find({userId : req.params.id});
        if(!con){throw 'Found nothing.'}
        res.status(200).json({result : con});
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getContinouWatching(req, res) {
    try {
        const con = await Con.findOne({userId : req.params.id,_id:req.params.conid}).exec();
        if(!con){throw 'Found nothing.'}
        res.status(200).json(con);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getContinouWatchingByTmdbId(req, res) {
    try {
        const con = await Con.findOne({userId : req.params.id,tmdbId:req.params.tmdbId}).exec();
        if(!con){res.status(200).json({});return}
        res.status(200).json(con);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function deleteContinouWatching(req, res) {
    try {
        console.log(req.params.id,req.params.conid);
        console.log(await Con.find({_id: new mongoose.Types.ObjectId(req.params.conid)}));
        const con = await Con.deleteOne({userId : req.params.id,_id:req.params.conid}).exec();
        console.log(con);
        if(con.deletedCount < 1 ){throw 'Could Not Delete Target.'}
        res.status(200).json({result:con});
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.toString() });
    }
    return;
}
