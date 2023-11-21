
import { arrayOf, getPage, releseDate } from '../routers/methods.js';
import createHttpError from "http-errors";
import dotenv from 'dotenv'
dotenv.config();

const tmdbURL = 'https://api.themoviedb.org/3/';
const APIKEY = process.env.TMDB_API;

const genre = [{ "id": 28, "name": "Action" }, { "id": 12, "name": "Adventure" }, { "id": 16, "name": "Animation" }, { "id": 35, "name": "Comedy" }, { "id": 80, "name": "Crime" }, { "id": 99, "name": "Documentary" }, { "id": 18, "name": "Drama" }, { "id": 10751, "name": "Family" }, { "id": 14, "name": "Fantasy" }, { "id": 36, "name": "History" }, { "id": 27, "name": "Horror" }, { "id": 10402, "name": "Music" }, { "id": 9648, "name": "Mystery" }, { "id": 10749, "name": "Romance" }, { "id": 878, "name": "Science Fiction" }, { "id": 10770, "name": "movie Movie" }, { "id": 53, "name": "Thriller" }, { "id": 10752, "name": "War" }, { "id": 37, "name": "Western" }];
export function getMovieGenreName(id) {
    return (genre.find((item) => item.id === id)).name || ''
}

/**
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 */



export async function getMovies(req, res) {
    try{
        //endpoint 
        const endpoint = 'discover/movie';
        //data to return
        const genre = arrayOf(req.query.genres);
        const page = getPage(req.query.page);
        //connection options
        const options = { method: 'GET', headers: { accept: 'application/json' } };
        //filter options
        const min_vote_avaragre = req.query.vote_avg_range || '2',max_release_date = releseDate(req.query.max_release_data),
        lowest_release_date = releseDate(req.query.lowest_release_data),with_origin_country = req.query.origin_country || '',
        sortby = req.query.sort || '';
        const filter = `?api_key=${APIKEY}&include_adult=true&include_video=true&with_companies=2|3|6194|33|4|5|25|420|1|521&page=${page}&with_genres=${genre}&sort_by=${sortby}&with_original_language=${with_origin_country}&release_date.lte=${max_release_date}&release_date.gte=${lowest_release_date}&vote_average.lte=9.8&vote_average.gte=${min_vote_avaragre}&without_poster=false`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint+filter, options);
        const data = await response.json();
        for (var item of data.results){
            item.genre_ids = item.genre_ids.map( (genreid) => {return {id : genreid,name : getMovieGenreName(genreid)}});
        }
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page:page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}

/**
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 */
export async function getMovie(req,res){
    try{
        //endpoint
        const endpoint = `movie/${req.params.id}?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const dataToReturn = await response.json();
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}

export async function getMovieById(id){
    try{
        //endpoint
        const endpoint = `movie/${id}?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const dataToReturn = await response.json();
        return dataToReturn;
    }catch(err){
        return err;
    }
}


const filterOption = `include_adult=true&include_video=false&with_companies=2|3|6194|33|4|5|25|420|1|521&vote_average.lte=10&vote_average.gte=3`
// Example function to retrieve popular movies
export async function getPopularMovie(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `movie/popular?${filterOption}&api_key=${APIKEY}&page=${page}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        for (var item of data.results){
            item.genre_ids = item.genre_ids.map( (genreid) => {return {id : genreid,name : getMovieGenreName(genreid)}});
        }
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}


export async function getNewestMovie(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `movie/now_playing?include_adult=true&include_video=false&language=en-US&with_companies=2|3|6194|33|4|5|25|420|1|521&api_key=${APIKEY}&page=${page}}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        for (var item of data.results){
            item.genre_ids = item.genre_ids.map( (genreid) => {return {id : genreid,name : getMovieGenreName(genreid)}});
        }
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        console.log(err);
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}


export async function getMostRatedMovie(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `movie/top_rated?${filterOption}&api_key=${APIKEY}&page=${page}}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        for (var item of data.results){
            item.genre_ids = item.genre_ids.map( (genreid) => {return {id : genreid,name : getMovieGenreName(genreid)}});
        }
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}



export async function getTrendingMovie(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `trending/movie/day?${filterOption}&api_key=${APIKEY}&page=${page}}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        for (var item of data.results){
            item.genre_ids = item.genre_ids.map( (genreid) => {return {id : genreid,name : getMovieGenreName(genreid)}});
        }
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}


export async function searchMovie(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `search/movie?${filterOption}&original_language=en&api_key=${APIKEY}&page=${page}&query=${req.query.q}}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        for (var item of data.results){
            item.genre_ids = item.genre_ids.map( (genreid) => {return {id : genreid,name : getMovieGenreName(genreid)}});
        }
        const dataToReturn = { result: data.results, total_pages: data.total_pages, total_results: data.total_results,page }
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}

export async function getMovieCast(req,res){
    try{
        //endpoint
        const endpoint = `movie/${req.params.id}/credits?api_key=${APIKEY}`
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

export async function getSimilarMovie(req,res){
    try{
        //
        const page = getPage(req.query.page);
        //endpoint
        const endpoint = `movie/${req.params.id}/recommendations?api_key=${APIKEY}&${filterOption}&original_language=en&${page}`
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


export async function getMovieTrailer(req,res){
    try{
        //endpoint
        const endpoint = `movie/${req.params.id}/videos?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.results){throw createHttpError.InternalServerError(data.status_message)}
        const dataToReturn = { result: (data.results).filter((item) => item.site === 'YouTube')}
        res.status(200).json(dataToReturn);
    }catch(err){
        res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    }
    return;
}


export async function getIMDB_M(id){
    try{
        //endpoint
        const endpoint = `movie/${id}/external_ids?api_key=${APIKEY}`
        //fetch data from api
        const response = await fetch(tmdbURL+endpoint);
        const data = await response.json();
        if(!data.imdb_id){throw createHttpError.InternalServerError(data.status_message)}
        const dataToReturn = { result: data.imdb_id}
        return dataToReturn;
    }catch(err){
        throw err;
    }
}