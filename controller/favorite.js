import createHttpError from "http-errors";
import dotenv from 'dotenv'
dotenv.config();
import { Fav } from "../model/favorite.js";
import { checkIfItId, isItId } from "../routers/methods.js";
export async function addFavorite(req, res) {
    try {
        if( await Fav.exists({tmdbId : req.body.id,userId : req.params.id})){return res.status(200).json({result : 'done'});}
        const newFav = await Fav.create(
            {
                tmdbId : req.body.id,
                userId : req.params.id,
                type : req.body.type,
                name:(req.tmdbData.original_title || req.tmdbData.original_name),
                release_date : (req.tmdbData.release_date||req.tmdbData.first_air_date),
                poster_path: req.tmdbData.poster_path
            }
            );
        if(!newFav){throw 'Could not completed.'}
        res.status(200).json({result:'done'});
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getFavorites(req, res) {
    try {
        const favs = await Fav.find({});
        res.status(200).json(favs);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getUserFavorite(req, res) {
    try {
        const fav = await Fav.find({userId : req.params.id});
        if(!fav){throw 'Found nothing.'}
        res.status(200).json({result:fav});
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getFavorite(req, res) {
    try {
        const fav = await Fav.findOne({userId : req.params.id,_id:req.params.favid});
        if(!fav){throw 'Found nothing.'}
        res.status(200).json(fav);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}




export async function deleteFavorite(req, res) {
    try {
        checkIfItId(req.params.favid);
        const fav = await Fav.deleteOne({userId : req.params.id,_id:req.params.favid}).exec();
        if(fav.deletedCount < 1 ){throw 'Could Not Delete Target.'}
        res.status(200).json({result :fav});
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}
