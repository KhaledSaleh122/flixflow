import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { param,body,query } from 'express-validator';
import { getMostRatedTVShows, getNewestTVShows, getPopularTvShow, getSimilarTVShows, getTVShowCast, getTrendingTVShows, getTvShow, getTvShowTrailer, getTvShows, searchTVShows } from '../controller/tv.js';
export const tvshowRouter = express.Router();


tvshowRouter.get('/',getTvShows);
tvshowRouter.get('/popular',getPopularTvShow);
tvshowRouter.get('/newest',getNewestTVShows);
tvshowRouter.get('/most-rated',getMostRatedTVShows);
tvshowRouter.get('/trending',getTrendingTVShows);
tvshowRouter.get('/search',[query('q').exists().isString()],validateResultMiddleware,searchTVShows);

tvshowRouter.get('/:id/cast',[param('id').exists().isInt().toInt()],validateResultMiddleware,getTVShowCast);
tvshowRouter.get('/:id/similer',[param('id').exists().isInt().toInt()],validateResultMiddleware,getSimilarTVShows);
tvshowRouter.get('/:id/trailer',[param('id').exists().isInt().toInt()],validateResultMiddleware,getTvShowTrailer);

tvshowRouter.get('/:id/',[param('id').exists().isInt().toInt()],validateResultMiddleware,getTvShow);