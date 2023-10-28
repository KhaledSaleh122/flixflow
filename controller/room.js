import createHttpError from "http-errors";
import dotenv from 'dotenv'
import { Room } from "../model/room.js";

dotenv.config();


export async function addInfoToRoom(req,res){
    try {
        const newCon = await Room.findOneAndUpdate({userId : req.params.id},
            {
                episode : (req.body.episode || 0),
                season : (req.body.season || 0),
                type : req.body.type,
                tmdbId : req.body.tmdbId
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

export async function getRoomInfo(req, res) {
    try {
        const room = await Room.findOne({userId : req.params.id});
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function updatePassword(req,res){
    try {
        const room = await Room.updateOne({userId : req.params.id},{password:req.body.password}).exec();
        if(room.matchedCount < 1){throw 'Could not update password.'}
        res.status(200).json(room);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}