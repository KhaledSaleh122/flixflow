import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import mongoose from "mongoose";
import { getTvShow, getTvShowById } from "../controller/tv.js";
import { getMovie, getMovieById } from "../controller/movie.js";
import { getPerson, getPersonById } from "../controller/person.js";

export const validateResultMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = createHttpError.UnprocessableEntity(errors);
    res.status(err.statusCode).json({error : 'Make sure you provided all required info.',statusCode : err.statusCode});
    return;
  }
  next();
};

export function arrayOf(item){
    var returnVal = (Array.isArray(item)?item:'');
    if(item && !Array.isArray(item)){
        returnVal  = item.split(' ');
    }
    return returnVal;
}


export function getPage(page) {
    page = Number(page);
    if (isNaN(page)) { return 1; }
    if (page > 500 || page < 1) { return 1 }
    return page;
}


export function releseDate(date) {
    if (!date) { return ''; }
    const relDate = new Date(date);
    if (isNaN(relDate.getFullYear())) { return '' }
    return relDate.getFullYear();
}

export function isItId(req,res,next){
  if(!mongoose.isValidObjectId(req.params.id)){res.status(500).json({error: 'Id is not valid'});return;}
  if(req.params.favid && !mongoose.isValidObjectId(req.params.favid)){res.status(500).json({error: 'itemId is not valid'});return;}
  if(req.params.conid && !mongoose.isValidObjectId(req.params.conid)){res.status(500).json({error: 'itemId is not valid'});return;}
  next();
}

export function checkIfItId(id){
  if(!mongoose.isValidObjectId(id)){throw 'Id is not valid'};
}

/**
 * @param {import('express').Request} req - The request object
 * @param {import('express').Response} res - The response object
 */
export function isAuthenticatedRequest(req,res,next){
  if(!req.isAuthenticated()){res.status(500).json({error: 'Not Authenticated.'});return;}
  next();
}

export async function isVaildTmdbId(req,res,next){
  try{
    const promis = await new Promise(async(resolve,reject)=>{
      switch(req.body.type){
        case 'tv' : resolve(await getTvShowById(req.body.id).catch(err=>reject(err)));break;
        case 'movie' : resolve(await getMovieById(req.body.id).catch(err=>reject(err)));break;
        case 'person': resolve(await getPersonById(req.body.id).catch(err=>reject(err)));break;
      }
    });
    req.tmdbData = promis;
    if(!promis.id){throw 'Tmdb id is wrong.'}
    next();
  }catch(err){
    res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    return;
  }
}

export async function isAdmin(user){
  if(user.admin){
    return true;
  }
  return false;
}

export async function adminMiddleWare(req,res,next){
  try{
    if(!isAdmin(req.user)){throw 'You must be admin.'}
    next();
  }catch(err){
    res.status(err.statusCode || 500).json({error : err.toString(),statusCode : err.statusCode || 500});
    return;
  }
}


export const subtitleLanguages = [
  "Albanian",
  "Arabic",
  "Bengali",
  "Brazillian Portuguese",
  "Bulgarian",
  "Burmese",
  "Chinese BG code",
  "Croatian",
  "Czech",
  "Danish",
  "Dutch",
  "English",
  "Estonian",
  "Farsi/Persian",
  "Finnish",
  "French",
  "German",
  "Greek",
  "Hebrew",
  "Hindi",
  "Hungarian",
  "Icelandic",
  "Indonesian",
  "Italian",
  "Japanese",
  "Korean",
  "Latvian",
  "Lithuanian",
  "Macedonian",
  "Malay",
  "Norwegian",
  "Polish",
  "Portuguese",
  "Romanian",
  "Russian",
  "Serbian",
  "Sinhala",
  "Slovak",
  "Slovenian",
  "Spanish",
  "Swedish",
  "Tagalog",
  "Thai",
  "Turkish",
  "Ukrainian",
  "Urdu",
  "Vietnamese",
].map(e=>e.toLowerCase());