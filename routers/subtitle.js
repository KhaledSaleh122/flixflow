import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { param,body,query } from 'express-validator';
import { getSubtitle, isSubtitleExist } from '../controller/video_v1.js';
export const subRouter = express.Router();
import https from 'https'
import { decrypt } from '../controller/video_handler.js';
import srt2vtt from 'srt-to-vtt'
import unzipper from 'unzipper';

subRouter.get('/file/:fileUrl',[param('fileUrl').exists().isString()],validateResultMiddleware,
(req,res)=>{
    //console.log(req.params.fileUrl);
    https.get(decrypt(req.params.fileUrl),(theRes)=>{
        theRes.pipe(res);
    })
})

subRouter.get('/v2/file/:fileUrl/:index',[param('fileUrl').exists().isString(),param('index').exists().isInt().toInt()],validateResultMiddleware,async(req,res)=>{
    try {
        const fileUrl = decrypt(req.params.fileUrl);
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        let index = req.params.index || 0;
        let counter = 0;
        await unzipper.Open.buffer(Buffer.from(arrayBuffer))
        .then(zip => {
          zip.files.forEach(entry => {
            if (entry.type === 'File' && (entry.path.endsWith('.srt') ||entry.path.endsWith('.vtt')) && (counter === index || index === 17)) {
                const stream = entry.stream();
                if(entry.path.endsWith('.srt')){
                    stream.pipe(srt2vtt()).pipe(res);
                }else{
                }
            }
            counter++;
          });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
})


subRouter.get('/:tmdbId/:lang/:id/:season/:episode',
[
    param('tmdbId').exists().isInt().toInt(),
    param('season').exists().isInt().toInt(),
    param('episode').exists().isInt().toInt(),
    param('lang').exists().isString(),
    param('id').exists().isString()
],(req,res,next)=>{req.params.type = 'tv';next();},validateResultMiddleware,
isSubtitleExist,getSubtitle)

subRouter.get('/:tmdbId/:lang/:id',
[
    param('tmdbId').exists().isInt().toInt(),
    param('lang').exists().isString(),
    param('id').exists().isString()
],(req,res,next)=>{req.params.type = 'movie';next();},validateResultMiddleware,
isSubtitleExist,getSubtitle)

