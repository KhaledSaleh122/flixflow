import axios from 'axios';
import crypto from 'crypto'
import dotenv from 'dotenv'
import { json } from 'express';
import https from 'https'
import { resetVideoData } from './video_v1.js';
const serverListDownloader = () =>{
    const info = {};
    info['serverOne'] = async(listURL,server)=>{
        const url = listURL.substring(0, listURL.indexOf('list'));
        const response = await axios.get(listURL);
        const listText = response.data;
        const convertedText = listText.replace(/RESOLUTION=\d+x\d+\n(.*?\.m3u8)/g, (match,content) => { return match.replace(content,`/video/file/${server}/${encrypt(url + content)}`) });
        return convertedText;
    }
    info['serverTwo'] = async(listURL,server)=>{
        const url = listURL.substring(0,listURL.lastIndexOf('/')+1);
        const response = await axios.get(listURL);
        const listText = response.data;
        const convertedText = listText.replace(/(index-|iframes-)[^"#]*/g, (match,content) => { return  `/video/file/${server}/${encrypt(url + match)}`});
        return convertedText;
    }
    return info
}

const x = `

#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-ALLOW-CACHE:YES
#EXT-X-PLAYLIST-TYPE:VOD
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:1
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-1-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-2-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-3-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-4-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-5-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-6-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-7-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-8-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-9-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-10-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,
https://loff7zr5.sw-cdnstream.com/hls2/01/00738/ni7zmmqcnust_h/seg-11-v1-a1.ts?t=6noG3sN8Lc-8Tp641Km0TJ3OP79no_pAMhNQJq74Xac&s=1698540295&e=129600&f=3693920&srv=ejjkmxupvsar&i=0.4&sp=500&p1=ejjkmxupvsar&p2=ejjkmxupvsar&asn=63949
#EXTINF:10.010,

`

console.log(x.replace(/(https)[^#]*/g, (match,content) => { return `/video/image/${1}/${encrypt('123123' + content)}`}));
const downloadList_handler = async(req,res) =>{
    try {
        const ListDownload = serverListDownloader();
        if(!req.params.fileUrl){throw new Error('List is missing!')}
        const listURL = decrypt(req.params.fileUrl);
        let list;
        switch(req.params.server){
            case 1:{
                list =await ListDownload.serverOne(listURL,req.params.server);
                break;
            }
            case 2:{
                list =await ListDownload.serverTwo(listURL,req.params.server);
                break;
            }
        }
        //console.log(list)
        res.setHeader('Content-Type', 'application/x-mpegURL');
        res.setHeader('Content-Length', Buffer.byteLength(list, 'utf-8'));
        res.status(200).send(list);
    } catch (error) {
        console.log(error);
        if(error.response && [403,404].find((el)=>el===error.response.status)){
            console.log(await resetVideoData(decrypt(req.params.fileUrl)));
        }
        res.status(500).json({error:"Error getting list,restart the page!"})
    }
}

const serverFileDownloader = () =>{
    const info = {};
    info['serverOne'] = async(fileURL,server)=>{
        const url = fileURL.substring(0, fileURL.lastIndexOf('/') + 1);
        const response = await axios.get(fileURL);
        const fileText = response.data;
        const convertedText = fileText.replace(/#EXTINF:\d+\.\d+,\s*([\s\S]*?)\n/g, (match,content) => { return match.replace(content,`/video/image/${server}/${encrypt(url + content)}`) });
        return convertedText;
    }
    info['serverTwo'] = async(fileURL,server)=>{
        const url = fileURL.substring(0, fileURL.lastIndexOf('/') + 1);
        const response = await axios.get(fileURL);
        const fileText = response.data;
        const convertedText = fileText.replace(/(https)[^#]*/g, (match,content) => { return `/video/image/${server}/${encrypt(url + content)}` });
        return convertedText;
    }
    return info
}

const downloadFile_handler = async(req,res) =>{
    try {
        const fileDownload = serverFileDownloader();
        if(!req.params.fileUrl){throw new Error('file is missing!')}
        const fileURL = decrypt(req.params.fileUrl);
        let file;
        switch(req.params.server){
            case 1:{
                file =await fileDownload.serverOne(fileURL,req.params.server);
                break;
            }
            case 2:{
                file =await fileDownload.serverTwo(fileURL,req.params.server);
                break;
            }
        }
        res.setHeader('Content-Type', 'application/x-mpegURL');
        res.setHeader('Content-Length', Buffer.byteLength(file, 'utf-8'));
        res.status(200).send(file);
    } catch (error) {
        //console.log(error);
        res.status(500).json({error:"Error getting file,restart the page!"})
    }
}

const serverImageDownloader = () =>{
    const info = {};
    info['serverOne'] = async(fileURL,res)=>{
        https.get(fileURL, (respo) => {
            respo.pipe(res);
        })
    }
    return info
}

const downloadImage_handler = async(req,res) =>{
    try {
        const fileDownload = serverImageDownloader();
        if(!req.params.fileUrl){throw new Error('file is missing!')}
        const fileURL = decrypt(req.params.fileUrl);
        const file =await fileDownload.serverOne(fileURL,res);
    } catch (error) {
        console.log(error);
        res.status(500).json({error:"Error getting file,restart the page!"})
    }
}

export {downloadList_handler,downloadFile_handler,downloadImage_handler}


dotenv.config();
const algorithm = 'aes-256-cbc';
const key = process.env.SEC; // Replace with your own secret key
const iv = process.env.iv // Generate a random initialization vector

export function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(process.env.SEC, 'hex'), Buffer.from(process.env.iv, 'hex'));
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

export function decrypt(encryptedData) {
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(process.env.SEC, 'hex'), Buffer.from(process.env.iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}