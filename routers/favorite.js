import express from 'express'
import { isAuthenticatedRequest, isItId, isVaildTmdbId, validateResultMiddleware } from './methods.js';
import { body, param, query } from 'express-validator';
import { addFavorite, deleteFavorite, getFavorite, getFavorites, getUserFavorite } from '../controller/favorite.js';
export const favoriteRouter = express.Router();

favoriteRouter.get('/',getFavorites);
favoriteRouter.post('/:id/',
    [
    body('type').exists().isString().isIn(['movie','tv','person']),
    body('id').exists().isInt().toInt(),
    param('id').exists().isString()
    ],isVaildTmdbId,addFavorite);
favoriteRouter.get('/:id/:favid',[param('id').exists().isString(),param('favid').exists().isString()],isItId,getFavorite);
favoriteRouter.get('/:id/',[param('id').exists().isString()],isItId,getUserFavorite);
favoriteRouter.delete('/:id/:favid',
[param('id').exists().isString(),param('favid').exists().isString()]
,isItId,deleteFavorite);
