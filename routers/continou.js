import express from 'express'
import { isAuthenticatedRequest, isItId, isVaildTmdbId, validateResultMiddleware } from './methods.js';
import { body, param, query } from 'express-validator';
import { addContinouWatch, deleteContinouWatching, getContinouWatching, getContinouWatchingByTmdbId, getContinousWatching, getUserContinouWatching } from '../controller/continou.js';
export const continouoRouter = express.Router();


continouoRouter.post('/:id',
    [
        param('id').exists().isString(),
        body('type').exists().isString().isIn(['movie', 'tv']),
        body('id').exists().isInt().toInt(),
        body('episode').optional().isInt().toInt(),
        body('season').optional().isInt().toInt(),
        body('time').exists().isInt().toInt(),
    ],isVaildTmdbId,addContinouWatch);

continouoRouter.get('/',getContinousWatching);
continouoRouter.get('/:id/',[param('id').exists().isString()],getUserContinouWatching);
continouoRouter.get('/user/:conid',[param('id').exists().isString(),param('conid').exists().isString()],getContinousWatching);
continouoRouter.get('/:id/:tmdbId/',[param('id').exists().isString(),param('tmdbId').exists().isInt().toInt()],isItId,getContinouWatchingByTmdbId);

continouoRouter.delete('/:id/:conid',
[param('id').exists().isString(),param('conid').exists().isString()]
,isItId,deleteContinouWatching);
