import createHttpError from "http-errors";
import dotenv from 'dotenv'
import { getPage } from "../routers/methods.js";
dotenv.config();

const tmdbURL = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.TMDB_API;

export async function getTrendingActors(req,res){
    try{
        //endpoint
        const endpoint = `trending/person/week?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        const dataToReturn = { result: data.results}
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}

export async function searchPerson(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `search/person?api_key=${APIKEY}&page=${page}&query=${req.query.q}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}


export async function getPerson(req,res){
    try{
        //endpoint
        const endpoint = `person/${req.params.id}?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const dataToReturn = await response.json();
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}

export async function getPersonById(id){
    try{
        //endpoint
        const endpoint = `person/${id}?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const dataToReturn = await response.json();
        return dataToReturn;
    }catch(err){
        return err;
    }
}


export async function getFilmography(req,res){
    try{
        //endpoint
        const endpoint = `person/${req.params.id}/combined_credits?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.cast){throw createHttpError.InternalServerError(data.status_message)}
        const dataToReturn = { result: data.cast}
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}
