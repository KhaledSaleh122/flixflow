import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { body, param, query } from 'express-validator';
import { search } from '../controller/combine.js';
export const combineRouter = express.Router();

combineRouter.get('/search',[query('q').exists().isString()],validateResultMiddleware,search);