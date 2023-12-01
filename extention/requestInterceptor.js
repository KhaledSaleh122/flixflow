let dataSaved = {};
let isGettingSubtitleDone = false;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  const server = serversHandler();
  if(message.type == "target_info"){
    console.log(message.data);
    dataSaved = message.data;
    switch(message.data.server){
      case 1: server.serverOne(message.data);break;
      case 2: server.serverTwo(message.data);break;
      case 3: server.serverThree(message.data);break;
      case 4: server.serverFour(message.data);break;
    }
  }else if(message.type =="check_url"){
    console.log(dataSaved);
    console.log()
    if((dataSaved.url && dataSaved.url.indexOf(message.data.location) >= 0) || message.data.fullLocation==="http://localhost:4000/s"){
      chrome.tabs.query({}, function (tabs) {
        console.log('ready_to_start');
        chrome.tabs.sendMessage(tabs[0].id, {type:"ready_to_start",data:dataSaved});
      })
    }
  }else if(message.type == "close_the_page"){
    chrome.tabs.query({}, function (tabs) {
      chrome.tabs.sendMessage(tabs[1].id, {type:"close_the_page"});
    })
  }else if(message.type == "is_there_data_to_save"){
    chrome.tabs.query({}, function (tabs) {
      if(tabs&& tabs[1] && dataSaved.data){
        chrome.tabs.sendMessage(tabs[1].id, {type:"save_data",data: dataSaved.data});
      }
    })
  }
})

const serversHandler = ()=>{
  const info = {}
  const request = requestHandler();
  const tab = tabHandler();
  /////server 1
  info['serverOne'] = (data) =>{
    if(data){
      request.serverOne();
      tab.serverOne(data);
      ///redirect to target url
    }
  }
  info['serverTwo'] = (data) =>{
    if(data){
      request.serverTwo();
      tab.serverTwo(data);
      ///redirect to target url
    }
  }
  info['serverThree'] = (data) =>{
    if(data){
      request.serverTwo();
      tab.serverThree(data);
      ///redirect to target url
    }
  }
  info['serverFour'] = (data) =>{
    if(data){
      request.serverTwo();
      tab.serverFour(data);
      ///redirect to target url
    }
  }
  /////
  return info;
}
const requestHandler = () =>{
  const info = {};
  const data = {}
  /////server 1
  const check = checkinUrlHandler(data);
  info['serverOne'] = ()=>{
    chrome.webRequest.onBeforeRequest.addListener(async(details) => {
      check.serverOne(details.url);
      console.log("Intercepted Request URL:", details.url)
    },{ urls: ["<all_urls>"] },["blocking"])
  }
  info['serverTwo'] = ()=>{
    chrome.webRequest.onBeforeRequest.addListener(async(details) => {
      check.serverTwo(details.url);
      if (details.url.indexOf("opensubtitles.org") >= 0) {
        data['subtitleURL'] = details.url;
      }
      console.log("Intercepted Request URL:", details.url)
    },{ urls: ["<all_urls>"] },["blocking"])
  }
  /*
  chrome.webRequest.onBeforeRequest.addListener(async (details) => {
    if (details.url.indexOf("rest.opensubtitles.org") >= 0 && !isGettingSubtitleDone) {
      isGettingSubtitleDone = true;
  
      // Log the original request details
      console.log(details);
  
      try {
        // Perform the duplicate request with a valid User-Agent header
        const response = await fetch(details.url, {
          method: details.method,  // Use the same method as the original request
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            ...details.requestHeaders,  // Include other headers from the original request
          },
          body: details.requestBody,  // Use the same request body as the original request, if applicable
        });
  
        if (response.ok) {
          const body = await response.json();
          data['subtitle'] = body;
          console.log(body);
        }
      } catch (error) {
        // Handle any errors that occur during the duplicate request
        console.error(error);
      }
    }
  }, { urls: ["<all_urls>"] }, ["blocking"]);
  */
  ////
  return info;
}
let invoked=false;
function getsubtitleX(data,url){
    if(invoked){return;}
    invoked = true;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = async function () {
      if (xhr.readyState == 4 && xhr.status == 200) {
        // Access and log the response data
        data['subtitle'] = await JSON.parse(xhr.responseText);
        console.log(data['subtitle']);
      }else if(!data['subtitle']){
        invoked = false;
        await new Promise((res)=>{setTimeout(res,10000)});
        getsubtitleX(data,url);
      }
    };
    xhr.send();
}

const tabHandler = () =>{
  const info = {};
  info['serverOne'] = (data)=>{
    chrome.tabs.query({}, function (tabs) {
      const url = 'https://vidsrc.to/embed';
      //console.log(`${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}` )
      dataSaved.url = `${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}`
        chrome.tabs.update(tabs[0].id, 
          { 
           // url: `${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}`,
           url: `http://localhost:4000/s`,
          }
        );
    })
  }
  info['serverTwo'] = (data)=>{
    chrome.tabs.query({}, function (tabs) {
      const url = ' https://vidsrc.me/embed';
      //console.log(`${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}` )
      dataSaved.url = `${url}/${data.type==='tv'?`tv?tmdb=${data.id}&season=${data.s}&episode=${data.e}`:`movie?tmdb=${data.id}`}`
      chrome.tabs.update(tabs[0].id, 
        { 
          url: `http://localhost:4000/s`,
        }
      );
    })
  }
  //https://www.2embed.cc/embed/{IMDB-ID}or{TMDB-ID}
  info['serverThree'] = (data)=>{
    chrome.tabs.query({}, function (tabs) {
      const url = 'https://www.2embed.cc';
      //console.log(`${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}` )
      dataSaved.url = `${url}/${data.type==='tv'?`/embedtv/${data.imdb}&s=${data.s}&e=${data.e}`:`/embed/${data.id}`}`
      chrome.tabs.update(tabs[0].id, 
        { 
          url: `http://localhost:4000/s`,
        }
      );
    })
  }
  info['serverFour'] = (data)=>{
    chrome.tabs.query({}, function (tabs) {
      const url = 'https://embed.smashystream.com';
      //https://embed.smashystream.com/playere.php?tmdb=299534
      //console.log(`${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}` )
      dataSaved.url = `${url}/${data.type==='tv'?`playere.php?imdb=${data.imdb}&season=${data.s}&episode=${data.e}`:`playere.php?imdb=${data.imdb}`}`
      chrome.tabs.update(tabs[0].id, 
        { 
          url: `http://localhost:4000/s`,
        }
      );
    })
  }
  // info['serverTwo'] = (data)=>{
  //   chrome.tabs.query({}, function (tabs) {
  //     const url = ' https://www.2embed.cc';
  //     //console.log(`${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}` )
  //     dataSaved.url = `${url}/${data.type==='tv'?`embedtv/${data.id}?s=${data.s}&e=${data.e}`:`embed/${data.id}`}`
  //     chrome.tabs.update(tabs[0].id, 
  //       { 
  //         url: `http://localhost:4000/s`,
  //       }
  //     );
  //   })
  // }
  return info;
}

const checkinUrlHandler = (data) =>{
  const info = {} 
  let sendConfirmMsg = false;
  info['serverOne'] = async (url)=>{
    if(url.indexOf('https://vidsrc.to/ajax/') >=0 && url.indexOf('subtitles') >=0 && !data['subtitle']){
      data['subtitle'] = url;
    }else if( ((url.indexOf('list') >=0 && url.indexOf('.m3u8') >=0) ||  url.indexOf('.m3u8') >=0) && ! data['list']){
      data['list'] = url;
    }
    if(data['list'] && !sendConfirmMsg){
      sendConfirmMsg = true;
      dataSaved.data = data;
    }
  }
  info['serverTwo'] = async(url)=>{
    if(url.indexOf('https://vidsrc.me/ajax/') >=0 && url.indexOf('subtitles') >=0 && !data['subtitle']){
      data['subtitle'] = url;
    }else if( ((url.indexOf('list') >=0 && url.indexOf('.m3u8') >=0) ||  url.indexOf('.m3u8') >=0 ) && ! data['list']){
      data['list'] = url;
    }
    if(data['list'] && !sendConfirmMsg){
      sendConfirmMsg = true;
      dataSaved.data = data;
    }
  }
  return info;
}

