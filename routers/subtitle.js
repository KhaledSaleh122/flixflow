import express from 'express'
import { validateResultMiddleware } from './methods.js';
import { param,body,query } from 'express-validator';
import { getSubtitle, isSubtitleExist } from '../controller/video_v1.js';
export const subRouter = express.Router();
import https from 'https'
import { decrypt } from '../controller/video_handler.js';
import srt2vtt from 'srt-to-vtt'
import zlib from 'zlib';
import { Readable } from 'stream';
import iconv from 'iconv-lite';
import subsrt from 'subsrt'
subRouter.get('/file/:fileUrl',[param('fileUrl').exists().isString()],validateResultMiddleware,
(req,res)=>{
    //console.log(req.params.fileUrl);
    https.get(decrypt(req.params.fileUrl),(theRes)=>{
        theRes.pipe(res);
    })
})

subRouter.get('/v2/file/:fileUrl/:encode/:id',[param('fileUrl').exists().isString(),param('id').exists().isString(),param('encode').exists().isString()],validateResultMiddleware,async(req,res)=>{
    try {
        const fileUrl = decrypt(req.params.fileUrl);
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        //console.log(req.params.encode);
        const arrayBuffer = await response.arrayBuffer();
        /*
        await unzipper.Open.buffer(Buffer.from(arrayBuffer))
        .then(zip => {
          zip.files.forEach(entry => {
            console.log(entry);
            if (entry.type === 'File' && (entry.path.endsWith('.srt') ||entry.path.endsWith('.vtt')) && (counter === index || index === 17)) {
                const stream = entry.stream();
                if(entry.path.endsWith('.srt')){
                    stream.pipe(srt2vtt()).pipe(res);
                }else{
                    stream.pipe(res);
                }
            }
            counter++;
          });
        });
        */
        zlib.gunzip(arrayBuffer, (err, decompressedData) => {
            if (err) {
              console.error('Error decompressing the gzipped file:', err);
              return;
            }
            // Convert the decompressed buffer to a string
           // console.log(fileUrl);
            let srtContent= iconv.decode(decompressedData, req.params.encode);
            //console.log(srtContent);
           // res.send(srtContent);
            console.log(srtContent);
            const readableStream = new Readable();
            var vtt = subsrt.convert(srtContent, { format: "vtt"});
            //let Content= iconv.decode(vtt, req.params.encode);
            console.log(vtt);
            readableStream.push(vtt);
            readableStream.push(null);
            // Set the response headers
            res.setHeader('Content-Type', 'text/vtt');
            //res.setHeader('Content-Disposition', 'attachment; filename="converted.srt"');
            //res.send(srtContent);
            // Send the converted VTT content as the response
            //readableStream.pipe(srt2vtt()).pipe(res);
            readableStream.pipe(res);
            
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

