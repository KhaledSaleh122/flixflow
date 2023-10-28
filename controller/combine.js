import createHttpError from "http-errors";
import dotenv from 'dotenv'
import { getPage } from "../routers/methods.js";
dotenv.config();

const tmdbURL = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.TMDB_API;

export async function search(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `search/multi?api_key=${APIKEY}&page=${page}&query=${req.query.q}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        const dataToReturn = { result: data.results.filter((el)=>el.media_type === "tv" || el.media_type === "movie" || !el.media_type), total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}