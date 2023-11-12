import axios from 'axios';
import crypto from 'crypto'
import dotenv from 'dotenv'
import { json } from 'express';
import https from 'https'
import { resetVideoData } from './video_v1.js';


const subHeaders = {
    'Cache-Control': 'no-cache',
    'Origin': 'https://vidsrc.stream',
    'Pragma': 'no-cache',
    'Referer': 'https://vidsrc.stream/prorcp/YTllMjE0NWFjZWE1NTkzOTdlMGE3N2NhMzk5ZTNlNWM6VmxsUGNVRkpUMW94UkhGeVFUazFiRmgyVDAxUk9XNU1kazF4YkdjcldXbGtSSGh3VWl0eWRtWjFUSGROTWxaSUwzRlZSVXBXTmxWYWVGbzRjMGhaYXpkalFYRXdORmszWkZBM2RrMUxkMUpUVkVaSVMyeFhNRE00U0hoeFZtRlhNMDVoTDJaQmNtaDZWV0pLUlhCTWNYazJkMkZOVEN0Rk4yRndhME5ZWjBsemQybzFRM1ZIV1dwVk9IUmpiMHN2UkZsVmNuSkRjRWd2TkVOck5VVktUUzk0U1d0SVlUQXpNVmhCYkZGU2JqYzNObXBYUWxKV1IyZHJTRk5rYjNvelVqVlZabUZhVjFGTE1sbGliMEZGTDI0eVVFTTVWSHBvTVc4MlpYWXlZVzlzYzFCbGJEZHJZV0pWZVZSMWFtNXJTbEJyTjJoU1FsTnFia3cwTlU5TlVIUXJLM1YxYVZOaGFEaDFWMjE0VXpOV1kwcDNUbVJyU0VncldWaHJhMGdyYzAxemQyeE5ZaTkxYzJKRmFHaG1Tek12Um1WUVpVZHlNU3RHVDBKSlJIcE5ZV28wWXpGSFVGSkpjR280WVN0dlZUaEVObU5yY25FMVlYRlVaMnAwYXpKMkszcHVaME5xTURoR2EzaFdZa3RyU0ZGM2NXdE5NMWhsVVhab2NVUXpia2RSVlVSelprbzBjMElyTlRJNU9IcDZlRlkxYWpZd2RXczFlVWxsVFdSeldsYzVOR293TDFkWUwzRjZOMVpYWjBaRVVIUkhlREpJT0c5Q2JXaFBOQzlpYjFOc01UaFNaMUpQWm5jMlRHWkhNbXh2Um5GclZFMXZZMkl5Tmtsek0zRmxUV0V3WTFJMGVVbHFMMUJOYkdoUFQxaFlObEJoT1RCTlR6TlVORlV4TUhkUE1tNHlaMDlJV21kRVNuVTVaMmhNWW1kcVdHUjZZMlZFZVV4SVN6QnhXaXRNTVVaVGQwdGlRVFUyWVhSSWFDOUlPRTFVWnk4Mk5HTlBibWxSZWxGeWFIbHZXR2xtYms5SlNVTm9kV3RpV0RSblFUMDk-',
    'Sec-Ch-Ua': '"Microsoft Edge";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
    'X-User-Agent': 'trailers.to-UA',
};

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
        const response = await axios.get(listURL,{method:"GET",headers:subHeaders});
        const listText = response.data;
        const convertedText = listText.replace(/(https:\/\/|index-|iframes-)[^"#]*/g, (match,content) => { return  `/video/file/${server}/${encrypt(url + match)}`});
        return convertedText;
    }
    info['serverThree'] = async(listURL,server)=>{
        const url = listURL.substring(0,listURL.lastIndexOf('/')+1);
        const response = await axios.get(listURL,{method:"GET",headers:subHeaders});
        const listText = response.data;
        const convertedText = listText.replace(/(https:\/\/|index-|iframes-)[^"#]*/g, (match,content) => { return  `/video/file/${server}/${encrypt(match)}\n`});
        return convertedText;
    }
    info['serverFour'] = async(listURL,server)=>{
        const url = listURL.substring(0,listURL.lastIndexOf('/')+1);
        const response = await axios.get(listURL,{method:"GET",headers:subHeaders});
        const listText = response.data;
        // const convertedText = listText.replace(/(https:\/\/|index-|iframes-)[^"#]*/g, (match,content) => { return  `/video/file/${server}/${encrypt(match)}\n`});
        return listText;
    }
    return info
}
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
                list =await ListDownload.serverThree(listURL,req.params.server);
                break;
            }
            case 3:{
                list =await ListDownload.serverThree(listURL,req.params.server);
                break;
            }
            case 4:{
                list =await ListDownload.serverFour(listURL,req.params.server);
                break;
            }
        }
        //console.log(list)
        res.setHeader('Content-Type', 'application/x-mpegURL');
        res.setHeader('Content-Length', Buffer.byteLength(list, 'utf-8'));
        res.status(200).send(list);
    } catch (error) {
        if(!error.response || [403,404].find((el)=>el===error.response.status)){
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
        const response = await axios.get(fileURL,{method:"GET",headers:subHeaders});
        const fileText = response.data;
        //const convertedText = fileText.replace(/#EXTINF:\d+\.\d+,\s*([\s\S]*?)\n/g, (match,content) => { return match.replace(content,`/video/image/${server}/${encrypt(url + content)}`) });
        return fileText;
    }
    info['serverThree'] = async(fileURL,server)=>{
        const url = fileURL.substring(0, fileURL.lastIndexOf('/') + 1);
        const response = await axios.get(fileURL,{method:"GET",headers:subHeaders});
        //console.log(response);
        const fileText = response.data;
        //const convertedText = fileText.replace(/#EXTINF:\d+\.\d+,\s*([\s\S]*?)\n/g, (match,content) => { return match.replace(content,`/video/image/${server}/${encrypt(url + content)}`) });
        return fileText;
    }
    info['serverFour'] = async(fileURL,server)=>{
        const url = fileURL.substring(0, fileURL.lastIndexOf('/') + 1);
        const response = await axios.get(fileURL);
        const fileText = response.data;
        //const convertedText = fileText.replace(/#EXTINF:\d+\.\d+,\s*([\s\S]*?)\n/g, (match,content) => { return match.replace(content,`/video/image/${server}/${encrypt(url + content)}`) });
        return fileText;
    }
    return info
}

const downloadFile_handler = async(req,res) =>{
    try {
        const fileDownload = serverFileDownloader();
        if(!req.params.fileUrl){throw new Error('file is missing!')}
        //console.log(req.params.fileUrl);
        const fileURL = decrypt(req.params.fileUrl);
        //console.log(fileURL);
        let file;
        switch(req.params.server){
            case 1:{
                file =await fileDownload.serverOne(fileURL,req.params.server);
                res.status(200).send(file);
                break;
            }
            case 2:{
                https.get(fileURL,{method:"GET",headers:subHeaders}, (respo) => {
                    respo.pipe(res);
                })
                //res.status(200).send(file);
                break;
            }
            case 3:{
                //file =await fileDownload.serverThree(fileURL,req.params.server);
                res.setHeader('Content-Type', 'text/html');
                https.get(fileURL,{method:"GET",headers:subHeaders}, (respo) => {
                    respo.pipe(res);
                })
                break;
            }
            case 4:{
                file =await fileDownload.serverFour(fileURL,req.params.server);
                res.status(200).send(file);
                break;
            }
        }
        //res.setHeader('Content-Type', 'application/x-mpegURL');
        //res.setHeader('Content-Length', Buffer.byteLength(file, 'utf-8'));
        //res.status(200).send(file);
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
        //console.log(error);
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