import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { getMostRatedMovie, getMovie, getMovieCast, getMovieTrailer, getMovies, getNewestMovie, getPopularMovie, getSimilarMovie, getTrendingMovie, searchMovie } from '../controller/movie.js';
import { param,body,query } from 'express-validator';
export const movieRouter = express.Router();


movieRouter.get('/',getMovies);
movieRouter.get('/popular',getPopularMovie);
movieRouter.get('/newest',getNewestMovie);
movieRouter.get('/most-rated',getMostRatedMovie);
movieRouter.get('/trending',getTrendingMovie);
movieRouter.get('/search',[query('q').exists().isString()],validateResultMiddleware,searchMovie);

movieRouter.get('/:id/cast',[param('id').exists().isInt().toInt()],validateResultMiddleware,getMovieCast);
movieRouter.get('/:id/similer',[param('id').exists().isInt().toInt()],validateResultMiddleware,getSimilarMovie);
movieRouter.get('/:id/trailer',[param('id').exists().isInt().toInt()],validateResultMiddleware,getMovieTrailer);

movieRouter.get('/:id/',[param('id').exists().isInt().toInt()],validateResultMiddleware,getMovie);



