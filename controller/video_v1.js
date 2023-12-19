import { getIMDB_M, getMovieById } from './movie.js';
import { URLSearchParams } from 'url';
import unzipper from 'unzipper';
var counterBrowsers = 0;
var browsers = [];
////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
/////
import dotenv from 'dotenv'
dotenv.config();
import { createServer } from "http";
/*puppeteer*/
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin());

import { getIMDB, getTvShowById } from './tv.js';
import { VideoModel } from '../model/video.js';
import { Sub } from '../model/subtitle.js';
import { decrypt, encrypt } from './video_handler.js';
import { Server } from 'socket.io';


const subHeaders = {
    'Accept': 'application/json, text/javascript, */*; q=0.01',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'ar,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
    'Cache-Control': 'no-cache',
    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
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

export async function getTargetVideo(req, res) {
    try {
        //try
        const info = {
            type: req.params.type,
            id: req.params.tmdbId,
            server: req.params.server,
            season: req.params.season || 0,
            episode: req.params.episode || 0
        }
        let data;
        const serverHandler = serversHandler();
        switch (info.server) {
            case 1: {
                data = await getVideo(info);
                if (!data.list) { throw 'couldn\'t find the target :: 3' }
                let serverData = await serverHandler.serverOne(data, info);
                data['subtitle'] = serverData.subtitle;
                saveData(info, data);
                res.status(200).json(
                    {
                        list: encrypt(data.list),
                        url: encrypt(data.list.substring(0, data.list.lastIndexOf('/') + 1)),
                        subtitle: serverData.subtitle.map((el) => { el.file = encrypt(el.file); return el })
                    }
                );
                break;
            }
            case 2: {
                data = await getVideo(info);
                if (!data.list) { throw 'couldn\'t find the target :: 6' }
                saveData(info, data);
                res.status(200).json({ list: encrypt(data.list), url: encrypt(data.list.substring(0, data.list.lastIndexOf('/') + 1)) });
                break;
            }
            case 3: {
                data = await getVideo(info);
                if (!data.list) { throw 'couldn\'t find the target :: 5' }
                saveData(info, data);
                res.status(200).json({ list: encrypt(data.list), url: encrypt(data.list.substring(0, data.list.lastIndexOf('/') + 1)) });
                break;
            }
            case 4: {
                data = await getVideo(info);
                if (!data.list) { throw 'couldn\'t find the target :: 5' }
                saveData(info, data);
                res.status(200).json({ list: encrypt(data.list), url: encrypt(data.list.substring(0, data.list.lastIndexOf('/') + 1)) });
                break;
            }
            default: {
                res.status(400).json({ error: 'couldn\'t find the target :: 4' });
            }
        }
        //console.log(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Couldn't find source video, Try again!", statusCode: 500 });
    }
}
async function saveData(info, data) {
    await VideoModel.findOneAndUpdate({ tmdbId: info.id, season: info.season || 0, episode: info.episode || 0, server: info.server },
        {
            subtitle: data['subtitle'],
            list: data['list'],
            type: info.type,
        },
        {
            upsert: true,
            new: true
        }
    ).exec();
}
async function sendVideoError(info) {
    //console.log(info);
    await VideoModel.findOneAndUpdate({ tmdbId: info.id, season: (info.season || 0), episode: (info.episode || 0), server: info.server },
        {
            error: "We Dont Have resource for this now come back later",
            type: info.type,
            expireAt: Date()
        },
        {
            upsert: true,
            new: true
        }
    ).exec();
}

const serversHandler = () => {
    const info = {};
    info['serverOne'] = async (data, info) => {
        const dataToReturn = { subtitle: [] };
        if (data['subtitle']) {
            dataToReturn['subtitle'] = await (await fetch(data['subtitle'])).json();
        }
        return dataToReturn;
    }
    return info;
}
//getVideo({type:"movie",id:238,season:1,episode:1,server:2});
const server = createServer();
server.listen(4003);
const io = new Server(server, {
    cookie: true,

    cors: {
      origin: `${process.env.SERVERURL}:4000`, // Replace with your domain
      methods: ['GET', 'POST'],
      credentials: true,

    }
});

io.on('connection', (socket) => {
    console.log('A user connected', socket.id);
    const finder = browsers.shift();
    finder(socket);
});

async function getVideo(info) {
    try {
        return await new Promise(async (resolve, reject) => {
            const browser = await createBrowser().catch(err => reject(err));
            const browserid = Math.random()*1000;
            const finder = async(socket) =>{
                try {
                    if (info.type === 'tv') {
                        info.imdb = (await getIMDB(info.id)).result;
                    } else {
                        info.imdb = (await getIMDB_M(info.id)).result;
                    }
                    socket.emit('data',info);
                    socket.on('data',async(info)=>{
                        resolve(info);
                        socket.disconnect(true);
                        counterBrowsers--;
                        if (browser) { await browser.close() };
                    })
                    socket.on("errorHandler",info=>{
    
                    })
                } catch (error) {
                    if (browser) { await browser.close() };
                    reject(error);
                }
            }
            browsers.push(finder)
            console.log(browsers);
        });
    } catch (error) {
        counterBrowsers--;
        throw (error);
    }
}
/////////////////////////////////////////

async function createBrowser() {
    /*
    const args = [
        '--disable-background-timer-throttling',
        '--disable-breakpad',
        '--disable-client-side-phishing-detection',
        '--disable-cloud-import',
        '--disable-default-apps',
        '--disable-dev-shm-usage',
        '--disable-extensions',
        '--disable-gesture-typing',
        '--disable-hang-monitor',
        '--disable-infobars',
        '--disable-notifications',
        '--disable-offer-store-unmasked-wallet-cards',
        '--disable-offer-upload-credit-cards',
        '--disable-popup-blocking',
        '--disable-print-preview',
        '--disable-prompt-on-repost',
        '--disable-setuid-sandbox',
        '--disable-speech-api',
        '--disable-sync',
        '--disable-tab-for-desktop-share',
        '--disable-translate',
        '--disable-voice-input',
        '--disable-wake-on-wifi',
        '--disk-cache-size=33554432',
        '--enable-async-dns',
        '--enable-simple-cache-backend',
        '--enable-tcp-fast-open',
        '--enable-webgl',
        '--hide-scrollbars',
        '--ignore-gpu-blacklist',
        '--media-cache-size=33554432',
        '--metrics-recording-only',
        '--mute-audio',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-sandbox',
        '--no-zygote',
        '--password-store=basic',
        '--prerender-from-omnibox=disabled',
        '--use-gl=swiftshader',
        '--use-mock-keychain',
        '--memory-pressure-off',
        '--start-maximized',
        '--disable-site-isolation-trials',
        `--disable-extensions-except=${__dirname + '/../extention/'}`,
        `--load-extension=${__dirname + '/../extention/'}`,
    ];
    */
    const args = [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        `--user-data-dir="${__dirname + '/../temp/'}"`,
        '--disable-web-security',
        '--disable-site-isolation-trials',
        `--load-extension=${__dirname + '/../extention/'},${__dirname + '/../ublock/'}`,
    ]
    if (counterBrowsers + 1 > 10) {
        throw 'Busy, Please wait 1 min and try again.'
    }
    counterBrowsers += 1;
    const brows = await puppeteer.launch(
        {
            executablePath: process.env.GOOGLEPATH,
            ignoreHTTPSErrors: false,
            headless: 'new',
            //devtools:true,
            //headless: false,
            args,
        }
    )
    return brows;
}


export async function isVideoInfoExists(req, res, next) {
    try {
        const videoInfo = await VideoModel.findOne(
            {
                tmdbId: req.params.tmdbId,
                server: req.params.server,
                type: req.params.type,
                season: (req.params.season || 0),
                episode: (req.params.episode || 0)
            }, "list subtitle error"
        );
        if (!videoInfo) {
            if (req.params.type === "tv") {
                const getUrlIfExists = await VideoModel.findOne(
                    {
                        tmdbId: req.params.tmdbId,
                        server: req.params.server,
                        type: req.params.type,
                    }, "url"
                );
                if (getUrlIfExists) { req.params.url = getUrlIfExists.url }
            }
            next();
            return;
        }
        if (videoInfo.list) { 
            videoInfo.url = encrypt(videoInfo.list.substring(0, videoInfo.list.lastIndexOf('/') + 1)) 
            videoInfo.list = encrypt(videoInfo.list);
        }
        //if (videoInfo.list) { videoInfo.list = videoInfo.list; }
        if (videoInfo.subtitle) { videoInfo.subtitle.map((el) => { el.file = encrypt(el.file); return el }) };
        res.status(200).json(videoInfo);
    } catch (err) {
        //console.log(err);
        res.status(err.statusCode || 500).json({ error: err.toString(), statusCode: err.statusCode || 500 });
    }
}


export async function resetVideoData(list) {
    try {
        const cleanedSearchQuery = list.replace(/[^\w\s]/g, (match) => '\\' + match);
        const video = await VideoModel.deleteOne({ list: { $regex: cleanedSearchQuery } }).exec();
        if (video.deleteCount < 1) { throw 'Could not delete video.' }
        return true;
    } catch (err) {
        return false
    }
}


//////////////////////subtitle


//console.log(await(await fetch("https://s2.putgate.org/static/5045b735211200d23890b8028a751c12/page-1.html",{method:'GET',headers:subHeaders})).arrayBuffer());
export async function getSubtitle(req, res) {
    try {
        const lang = req.params.lang;
        //console.log(lang)
        const id = req.params.id;
        const promis = await new Promise(async (resolve, reject) => {
            //const browser = await createBrowser().catch(err => { reject(err); return; });
            try {
                const tmdb_Data = (req.params.type === 'movie' ? await getMovieById(req.params.tmdbId) : await getTvShowById(req.params.tmdbId));
                var imdb = tmdb_Data.imdb_id
                if (!imdb) {
                    if (req.params.type === 'tv') {
                        imdb = (await getIMDB(req.params.tmdbId)).result;
                    } else {
                        imdb = (await getIMDB_M(req.params.tmdbId)).result;
                    }
                }
                //console.log("imdb id : ",imdb);
                if (imdb) {
                    imdb = imdb.split('tt')[1];
                }
                if (!imdb) { throw 'IMDB id Error' }

                //const page = (await browser.pages())[0];

                //await page.goto(`https://vidsrc.stream/prorcp/ZGE5ZjcwZTI2ODQyNTgwNWNlMjQ0MGQzMTE5ZTEwZmM6YW1KbGVrVTBSalJJTkU5R1ZUQndRMHh4Y25adWMzWk5aemxKT1hwTmVrZDVXVzlZYW5VeGJHcHplVU4wY0ZRck0xWnFjalIyV1VkRFRIbHlWWGxXTmxZNVpGTkZRa1pGVUhKRFZ6Vm5XbTFyZDFSeVMyaEVlWE4zTmpscFlua3JPRzVyWTNCQ1ZrbHBjalJvUXpkdUx6QTFOalpEU0VsRFZrWXhZM0U1UjJSd0wxa3lUVzB3Vm5CbVUyUmxhbWxKVDFjMlpURnhZekYwY201cWNWaG9ORGhVWTJ4VFNYcDNVbU5YUjNNNVJIQlBlREJJUm0xNVpqUkhUbU50YTJRclNITjBRbTl3VFVOc00zcG9ja1JhVHpacU5XNXlSR2xpVkhWcGEzSm1ibXRwTDJWNk0xbHhWMmNyYml0TFdVbFdaRmQyWmpkb04ySjRjVVZ3U3prMlRYQnlaSGxaU0ZOU1EzSnVTV3RXWmxKSmF6UjVVemRaYVRWRWFXSmlXRTlNTDAweWJIWm1MMnhUUkZKa04wNVNkakJwTldaS2RERlNUV3AyYW5KWWNWZEdkVFJ0UWtOWGQzVjROMVZwVmxVNVVtSXpRV3RNUTJKQk0wVnRXRFpOTTJ0NWFXSndXa3MzTlhGaWVVZEdiVVpWUmpaalVVaGpZWEoyUzJ0bE9VNVpibVphTkZNeVNqZGxOVEUxYm1Vd1dHTjZMMWRLZG5FNUswOUZabTl5TkdGbllWZFJZUzh6VTNWNVpFSlJOUzh2TjA0NFp6QkJWM3BwT0dGWlFWQjBTa2xLYldrMlEwZEVRekl3V25sQmN6WnhjME14YzBOWWJuRjVUWGhCWVVGS1NTc3phbmh6YWxSMWNsZGplUzlxT1VoWlQwWnpjbXRCVlVkUFUyaEpVazVTYVc5NVJ6RnBPRkZaVnprM1pGQkdjSGhxVGk5SldrZzJRbnAzU25ZM1NtdElTR3hJYkZOb1RFMVNRVVppV1hJclowZDNhRkU0Y25scVpHdEpZMFpMZUhwVmNHTTBaM0JMZGpGd1RuRXJUbXRZYUV0alVUMDk-`);
                let fetchURL;
                if (req.params.type === 'tv') {
                    fetchURL = `https://rest.opensubtitles.org/search/episode-${req.params.episode}/imdbid-${imdb}/season-${req.params.season}`
                } else {
                    fetchURL = `https://rest.opensubtitles.org/search/imdbid-${imdb}`
                }
                const jsonData = (await (await fetch(fetchURL, {
                    method: 'GET',
                    headers: subHeaders,
                })).json());
                //console.log(jsonData[0]);
                resolve(jsonData);
            } catch (error) {
                console.log(error);
                //await browser.close();
                //counterBrowsers -= 1;
                reject(`Couldn't find any subtitle for ${lang}!`);
            }
        });
        //console.log(lang);
        const newSub = await Sub.findOneAndUpdate({ tmdbId: req.params.tmdbId, season: (req.params.season || 0), episode: (req.params.episode || 0) },
            {
                data: promis,
                type: req.params.type
            },
            {
                upsert: true,
                new: true
            }
        ).exec();
        //console.log(id);
        const targetData = promis.filter((el) => el.SubLanguageID === id);
        if (targetData.length === 0) { throw new Error(`Couldn't find any subtitle for ${lang}!`) }
        const returnData = (targetData.map((el) => { return { list: encrypt(el.SubDownloadLink), encode: el.SubEncoding } })).slice(0, 17);
        res.status(200).json(returnData);
    } catch (err) {
        console.log(err);
        res.status((err && err.statusCode) || 500).json({ error: err.toString(), statusCode: err.statusCode || 500 });
    }
}
const testSubtitleMovie = async (url) => {
    const returnURL = [];
    return await new Promise((resolve) => {
        url.forEach(async (v, i) => {
            //console.log(decrypt(v));
            try {
                const response = await fetch(decrypt(url));
                if (response.ok) {
                    returnURL.push(url[i]);
                }
            } catch (error) {
                // console.log(error);
            }
            if (i === url.length - 1) {
                resolve(returnURL);
            }
        })
    })
}
export async function isSubtitleExist(req, res, next) {
    //console.log(req.params.lang);
    try {
        const subInfo = await Sub.findOne({
            tmdbId: req.params.tmdbId,
            type: req.params.type,
            season: (req.params.season || 0),
            episode: (req.params.episode || 0),
        })
        //console.log(req.params.tmdbId,req.params.type,req.params.season||0,req.params.episode || 0);
        //console.log(subInfo);
        if (!subInfo) { next(); return; }
        const targetData = subInfo.data.filter((el) => el.SubLanguageID === req.params.id);
        if (targetData.length === 0) { throw new Error(`Couldn't find any subtitle for ${req.params.lang}!`) }
        const returnData = (targetData.map((el) => { return { list: encrypt(el.SubDownloadLink), encode: el.SubEncoding } })).slice(0, 17);
        res.status(200).json(returnData);
    } catch (err) {
        res.status(err.statusCode || 500).json({ error: err.toString(), statusCode: err.statusCode || 500 });
    }
}

async function downloadAndProcessZip(url) {
    try {
        const response = await fetch(decrypt(url));
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const arrayBuffer = await response.arrayBuffer();

        const srtFiles = [];
        let index = 0;

        await unzipper.Open.buffer(Buffer.from(arrayBuffer))
            .then(zip => {
                zip.files.forEach(entry => {
                    if (entry.type === 'File' && (entry.path.endsWith('.srt') || entry.path.endsWith('.vtt'))) {
                        srtFiles.push(index);
                    }
                    index++;
                });
            });
        //console.log(srtFiles);
        return srtFiles;
    } catch (error) {
        console.error('Error:', error);
    }
}


// const urlX = 'https://rest.opensubtitles.org/search/episode-1/imdbid-9140554/season-1';

// const headers = {
//   'Accept': 'application/json, text/javascript, */*; q=0.01',
//   'Accept-Encoding': 'gzip, deflate, br',
//   'Accept-Language': 'ar,en;q=0.9,en-GB;q=0.8,en-US;q=0.7',
//   'Cache-Control': 'no-cache',
//   'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
//   'Origin': 'https://vidsrc.stream',
//   'Pragma': 'no-cache',
//   'Referer': 'https://vidsrc.stream/prorcp/YTllMjE0NWFjZWE1NTkzOTdlMGE3N2NhMzk5ZTNlNWM6VmxsUGNVRkpUMW94UkhGeVFUazFiRmgyVDAxUk9XNU1kazF4YkdjcldXbGtSSGh3VWl0eWRtWjFUSGROTWxaSUwzRlZSVXBXTmxWYWVGbzRjMGhaYXpkalFYRXdORmszWkZBM2RrMUxkMUpUVkVaSVMyeFhNRE00U0hoeFZtRlhNMDVoTDJaQmNtaDZWV0pLUlhCTWNYazJkMkZOVEN0Rk4yRndhME5ZWjBsemQybzFRM1ZIV1dwVk9IUmpiMHN2UkZsVmNuSkRjRWd2TkVOck5VVktUUzk0U1d0SVlUQXpNVmhCYkZGU2JqYzNObXBYUWxKV1IyZHJTRk5rYjNvelVqVlZabUZhVjFGTE1sbGliMEZGTDI0eVVFTTVWSHBvTVc4MlpYWXlZVzlzYzFCbGJEZHJZV0pWZVZSMWFtNXJTbEJyTjJoU1FsTnFia3cwTlU5TlVIUXJLM1YxYVZOaGFEaDFWMjE0VXpOV1kwcDNUbVJyU0VncldWaHJhMGdyYzAxemQyeE5ZaTkxYzJKRmFHaG1Tek12Um1WUVpVZHlNU3RHVDBKSlJIcE5ZV28wWXpGSFVGSkpjR280WVN0dlZUaEVObU5yY25FMVlYRlVaMnAwYXpKMkszcHVaME5xTURoR2EzaFdZa3RyU0ZGM2NXdE5NMWhsVVhab2NVUXpia2RSVlVSelprbzBjMElyTlRJNU9IcDZlRlkxYWpZd2RXczFlVWxsVFdSeldsYzVOR293TDFkWUwzRjZOMVpYWjBaRVVIUkhlREpJT0c5Q2JXaFBOQzlpYjFOc01UaFNaMUpQWm5jMlRHWkhNbXh2Um5GclZFMXZZMkl5Tmtsek0zRmxUV0V3WTFJMGVVbHFMMUJOYkdoUFQxaFlObEJoT1RCTlR6TlVORlV4TUhkUE1tNHlaMDlJV21kRVNuVTVaMmhNWW1kcVdHUjZZMlZFZVV4SVN6QnhXaXRNTVVaVGQwdGlRVFUyWVhSSWFDOUlPRTFVWnk4Mk5HTlBibWxSZWxGeWFIbHZXR2xtYms5SlNVTm9kV3RpV0RSblFUMDk-',
//   'Sec-Ch-Ua': '"Microsoft Edge";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
//   'Sec-Ch-Ua-Mobile': '?0',
//   'Sec-Ch-Ua-Platform': '"Windows"',
//   'Sec-Fetch-Dest': 'empty',
//   'Sec-Fetch-Mode': 'cors',
//   'Sec-Fetch-Site': 'cross-site',
//   'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0',
//   'X-User-Agent': 'trailers.to-UA',
// };

// console.log(await fetch(urlX, { method: 'GET', headers })
//   .then(response => response.json())
//   .then(data => console.log(data))
//   .catch(error => console.error('Error:', error)));
