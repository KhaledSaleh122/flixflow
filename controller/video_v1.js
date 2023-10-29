import { getIMDB_M, getMovieById } from './movie.js';
import { URLSearchParams } from 'url';
import unzipper from 'unzipper';
var counterBrowsers = 0;
////
import * as url from 'url';
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
/////
import dotenv from 'dotenv'
dotenv.config();

/*puppeteer*/
import puppeteer from 'puppeteer-extra'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

puppeteer.use(StealthPlugin());

import { getIMDB, getTvShowById } from './tv.js';
import { VideoModel } from '../model/video.js';
import { Sub } from '../model/subtitle.js';
import { decrypt, encrypt } from './video_handler.js';
import axios from 'axios';

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
                saveData(info,data);
                res.status(200).json({ list: encrypt(data.list), subtitle: serverData.subtitle.map((el) => { el.file = encrypt(el.file); return el }) });
                break;
            }
            case 2:{
                data = await getVideo(info);
                if (!data.list) { throw 'couldn\'t find the target :: 3' }
                saveData(info,data);
                res.status(200).json({list:encrypt(data.list)});
                break;
            }
            default: {
                res.status(400).json({ error: 'couldn\'t find the target :: 4' });
            }
        }
        //console.log(data);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Couldn't find source video, Try again later!", statusCode: 500 });
    }
}
async function saveData(info,data){
    await VideoModel.findOneAndUpdate({ tmdbId: info.id, season: info.season || 0, episode: info.episode || 0, server:info.server },
        {
            subtitle: data['subtitle'],
            list: data['list'],
            type:info.type,
        },
        {
            upsert: true,
            new: true
        }
    ).exec();
}
async function sendVideoError(info) {
    console.log(info);
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
        const dataToReturn = {subtitle:[]};
        if (data['subtitle']) {
            try {
                dataToReturn['subtitle'] = (await axios.get(data['subtitle'])).data;
            } catch (error) {
                
            }
        }
        return dataToReturn;
    }
    return info;
}
//getVideo({type:"movie",id:238,season:1,episode:1,server:2});
async function getVideo(info) {
    try {
        return await new Promise(async (resolve, reject) => {
            const browser = await createBrowser().catch(err => reject(err))
            try {
                
                const timeout = setTimeout(async () => {
                    if (browser) { await browser.close() };
                    counterBrowsers--;
                    reject('couldn\'t find the target :: 2');
                    //sendVideoError(info);
                }, 20000)
                
                
                const page = await browser.newPage();
                await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
                
                const waiting = await page.evaluate(async (type, id, s, e, server) => {
                    return await new Promise((reslove, reject) => {
                        const info = { type, id, s, e, server }
                        window.postMessage({ type: 'data_from_web', data: info }, '*');
                        //setInterval(() => console.log('still here'), 1000);
                        window.addEventListener('message', function (event) {
                            if (event.data.type === "close_the_page") {
                                reslove('done');
                                return;
                            }
                        });
                    })
                }, info.type, info.id, info.season, info.episode, info.server);
                
                await page.close();
                let reqData;
                const getDataInterval = setInterval(async()=>{
                    let infoPage = await browser.newPage();
                    await infoPage.goto('http://localhost:8080');
                    reqData = await infoPage.evaluate(el => localStorage.getItem('data'));
                    await infoPage.close();
                    if (reqData) {
                        clearTimeout(timeout);
                        clearInterval(getDataInterval);
                        counterBrowsers--;
                        if (browser) { await browser.close() };
                        console.log(reqData);
                        resolve(JSON.parse(reqData));
                        return;
                    }
                },1500);  
            } catch (error) {
                if (browser) { await browser.close() };
                reject(error);
            }
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
        '--remote-debugging-port=4003',
        '--disable-setuid-sandbox',
        '--no-sandbox',
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
                season: (req.params.season ||0),
                episode: (req.params.episode||0)
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
        if (videoInfo.list) { videoInfo.list = encrypt(videoInfo.list); }
        if (videoInfo.subtitle) { videoInfo.subtitle.map((el) => { el.file = encrypt(el.file); return el }) };
        res.status(200).json(videoInfo);
    } catch (err) {
        console.log(err);
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


export async function getSubtitle(req, res) {
    try {
        const lang = req.params.lang;
        //console.log(lang)
        const id = req.params.id;
        const promis = await new Promise(async (resolve, reject) => {
            const browser = await createBrowser().catch(err => { reject(err); return; });
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
                const page = (await browser.pages())[0];
                await page.goto(`https://www.opensubtitles.org/en/search/sublanguageid-${id}/imdbid-${imdb}`,{ timeout: 10000 });
                await page.addScriptTag({ url: 'https://code.jquery.com/jquery-3.6.0.min.js' });
                let counterTry = 0;
                while (counterTry < 5) {
                    try {
                        await page.waitForSelector('#n3twork', { timeout: 3000 });
                        break;
                    } catch (error) {
                        await page.reload();
                    }
                    counterTry--;
                }
                const pageNetWORK = await page.$('#n3twork');
                console.log(pageNetWORK);
                let defurl = [];
                if (pageNetWORK) {
                    defurl = await page.evaluate((type, season, episode) => {
                        var url = [];
                        console.log($);
                        var base = 'https://www.opensubtitles.org';
                        if (type === 'tv') {
                            const data = ($($(($('#season-' + season).parents('tr').nextAll())[episode - 1]).children('td:nth-child(3)')).children('a').attr('href'));
                            if (data) {
                                url.push(base + data);
                            }
                        } else {
                            $('tr.change.expandable').each((i, v) => {
                                if (i > 7) { return; }
                                const data = $($(v).children('td:nth-child(5)')).children('a').attr('href')
                                if (data) {
                                    url.push(base);
                                }
                            })
                        }
                        return url;
                    }, req.params.type, req.params.season, req.params.episode);
                }
                const url = defurl.map((el) => encrypt(el));
                await browser.close();
                counterBrowsers -= 1;
                if (url.length > 0) {
                    if (req.params.type === 'movie') {
                        const returnURLS = await testSubtitleMovie(url);
                        if (returnURLS.length === 0) {
                            reject(`Couldn't find any subtitle for ${lang}!`);
                            return;
                        }
                        resolve({ data: { url: returnURLS }, lang });
                        return;
                    }
                    resolve({ data: { url, index: await downloadAndProcessZip(url[0]) }, lang });
                }
                reject(`Couldn't find any subtitle for ${lang}!`);
            } catch (error) {
                await browser.close();
                counterBrowsers -= 1;
                reject(`Couldn't find any subtitle for ${lang}!`);
            }
        });
        //console.log(lang);
        const newSub = await Sub.findOneAndUpdate({ tmdbId: req.params.tmdbId, season: (req.params.season || 0), episode: (req.params.episode || 0) },
            {
                lang,
                data: promis.data,
                type: req.params.type,
            },
            {
                upsert: true,
                new: true
            }
        ).exec();
        res.status(200).json(promis);
    } catch (err) {
        console.log(err);
        res.status((err && err.statusCode) || 500).json({ error: err.toString(), statusCode: err.statusCode || 500 });
    }
}
const testSubtitleMovie = async (url) => {
    const returnURL = [];
    return await new Promise((resolve) => {
        url.forEach(async (v, i) => {
            console.log(decrypt(v));
            try {
                const response = await fetch(decrypt(url));
                if (response.ok) {
                    returnURL.push(url[i]);
                }
            } catch (error) {
                console.log(error);
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
            lang: req.params.lang
        })
        if (!subInfo) { next(); return; }
        res.status(200).json(subInfo);
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