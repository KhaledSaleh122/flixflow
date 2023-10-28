import express from 'express'
import { isAuthenticatedRequest, isItId, validateResultMiddleware } from './methods.js';
import { addInfoToRoom, getRoomInfo, updatePassword } from '../controller/room.js';
import { body, param } from 'express-validator';

export const roomRouting = express.Router();

roomRouting.post('/:id/',
[
    param('id').exists().isString(),
    body('type').exists().isString().isIn(['movie','tv']),
    body('tmdbId').exists().isInt().toInt(),
    body('episode').optional().isInt().toInt(),
    body('season').optional().isInt().toInt(),
]
,validateResultMiddleware,isItId,addInfoToRoom)


roomRouting.get('/info/:id',getRoomInfo);

roomRouting.patch('/:id/password/',[body('password').exists().isString()],validateResultMiddleware,updatePassword)