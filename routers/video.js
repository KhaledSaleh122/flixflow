import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { param,body,query } from 'express-validator';
import { getTargetVideo, isVideoInfoExists, resetVideoData} from '../controller/video_v1.js';
import { downloadFile_handler, downloadImage_handler, downloadList_handler, download_handler } from '../controller/video_handler.js';
export const videoRouter = express.Router();

videoRouter.get('/movie/:tmdbId/:server',
[
    param('tmdbId').exists().isInt().toInt(),
    param('server').exists().isInt({min:1,max:4}).toInt()
],validateResultMiddleware,(req,res,next)=>{req.params.type = 'movie';next();},isVideoInfoExists,getTargetVideo);

videoRouter.get('/tv/:tmdbId/:server/:season/:episode',
[
    param('tmdbId').exists().isInt().toInt(),
    param('season').exists().isInt().toInt(),
    param('episode').exists().isInt().toInt(),
    param('server').exists().isInt({min:1,max:4}).toInt()
],validateResultMiddleware,(req,res,next)=>{req.params.type = 'tv';next();},isVideoInfoExists,getTargetVideo);

videoRouter.get('/list/:server/:fileMainUrl/:fileUrl', [param('fileUrl').exists().isString(),param('fileMainUrl').exists().isString(),param('server').exists().isInt().toInt()], validateResultMiddleware,downloadList_handler)
videoRouter.get('/list/:server/:fileMainUrl/*', [param('fileMainUrl').exists().isString(),param('server').exists().isInt().toInt()], validateResultMiddleware,download_handler)
videoRouter.get('/file/:list/:server/:fileUrl', [param('fileUrl').exists().isString(),param('server').exists().isInt().toInt(),param('list').exists().isString()], validateResultMiddleware,downloadFile_handler)
videoRouter.get('/image/:server/:fileUrl', [param('fileUrl').exists().isString(),param('server').exists().isInt().toInt()], validateResultMiddleware,downloadImage_handler)

videoRouter.delete('/reset',resetVideoData)

