import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { body, param, query } from 'express-validator';
import { getFilmography, getPerson, getTrendingActors, searchPerson } from '../controller/person.js';
export const personRouter = express.Router();

personRouter.get("/trending",getTrendingActors);
personRouter.get("/search",[query('q').exists().isString()],validateResultMiddleware,searchPerson);


personRouter.get('/:id/filmography',[param('id').exists().isInt().toInt()],validateResultMiddleware,getFilmography);
personRouter.get('/:id/',[param('id').exists().isInt().toInt()],validateResultMiddleware,getPerson);
