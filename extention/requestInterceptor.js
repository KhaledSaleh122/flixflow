let dataSaved = {};
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message);
  const server = serversHandler();
  if(message.type == "target_info"){
    console.log(message.data);
    dataSaved = message.data;
    switch(message.data.server){
      case 1: server.serverOne(message.data);break;
      case 2: server.serverTwo(message.data);break;
    }
  }else if(message.type =="check_url"){
    console.log(dataSaved);
    console.log()
    if((dataSaved.url && dataSaved.url.indexOf(message.data.location) >= 0) || message.data.fullLocation==="http://localhost:8080/s"){
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
  /////
  return info;
}

const requestHandler = () =>{
  const info = {};
  /////server 1
  const check = checkinUrlHandler();
  info['serverOne'] = ()=>{
    chrome.webRequest.onBeforeRequest.addListener(async(details) => {
      check.serverOne(details.url);
      console.log("Intercepted Request URL:", details.url)
    },{ urls: ["<all_urls>"] },["blocking"])
  }
  info['serverTwo'] = ()=>{
    chrome.webRequest.onBeforeRequest.addListener(async(details) => {
      check.serverTwo(details.url);
      console.log("Intercepted Request URL:", details.url)
    },{ urls: ["<all_urls>"] },["blocking"])
  }
  ////
  return info;
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
      const url = ' https://www.2embed.cc';
      //console.log(`${url}/${data.type}/${data.id}${data.type==='tv'?`/${data.s}/${data.e}`:''}` )
      dataSaved.url = `${url}/${data.type==='tv'?`embedtv/${data.id}?s=${data.s}&e=${data.e}`:`embed/${data.id}`}`
      chrome.tabs.update(tabs[0].id, 
        { 
          url: `http://localhost:4000/s`,
        }
      );
    })
  }
  return info;
}

const checkinUrlHandler = () =>{
  const info = {}
  const data = {}; 
  let sendConfirmMsg = false;
  info['serverOne'] = (url)=>{
    if(url.indexOf('https://vidsrc.to/ajax/') >=0 && url.indexOf('subtitles') >=0 && !data['subtitle']){
      data['subtitle'] = url;
    }else if( (url.indexOf('list') >=0 && url.indexOf('.m3u8') >=0) ||  url.indexOf('.m3u8') >=0 && ! data['list']){
      data['list'] = url;
    }
    if(data['list'] && !sendConfirmMsg){
      sendConfirmMsg = true;
      dataSaved.data = data;
    }
  }
  info['serverTwo'] = (url)=>{
    if(url.indexOf('https://vidsrc.me/ajax/') >=0 && url.indexOf('subtitles') >=0 && !data['subtitle']){
      data['subtitle'] = url;
    }else if( (url.indexOf('list') >=0 && url.indexOf('.m3u8') >=0) ||  url.indexOf('.m3u8') >=0 && ! data['list']){
      data['list'] = url;
    }
    if(data['list'] && !sendConfirmMsg){
      sendConfirmMsg = true;
      dataSaved.data = data;
    }
  }
  return info;
}

