const messagex = { type: 'is_there_data_to_save' };
chrome.runtime.sendMessage(messagex);
window.addEventListener('message', function (event) {
    console.log(event.data.type);
    if (event.data.type === "data_from_web") {
        const message = { type: 'target_info', data: event.data.data };
        chrome.runtime.sendMessage(message);
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    if (message.type === "ready_to_start") {
        const start = startHandler();
        start.newest(message.data);
        switch (message.data.server) {
            case 1: start.newest(message.data); break;
            case 2: start.newest(message.data); break;
        }
    } else if (message.type === "close_the_page") {
        window.postMessage({ type: 'close_the_page' }, '*');
    } else if (message.type === "save_data") {
        //window.postMessage({ type: 'this_is_requierd_data'},'*');
        localStorage.setItem('data', JSON.stringify(message.data));
    }
})
let b = true;
const startHandler = () => {
    const info = {};
    info['serverOne'] = () => {
        while (true) {
            const button = document.querySelector('#btn-play');
            if (!button) { break; }
            chrome.runtime.sendMessage({ data: 'clicked' });
            button.click();
        }
        const message = { type: 'close_the_page' };
        chrome.runtime.sendMessage(message);
    }
    info['serverTwo'] = async (data) => {
        try {
            const x = document.body.children.length;
            for(let i =0;i < x;i++){
                document.body.children[i].remove();
            }
            console.log('add iframe')
            const newIframe = document.createElement('iframe');
            newIframe.src = data.url;
            newIframe.style.height='100vh';
            newIframe.style.width='100vw';
            document.body.append(newIframe);
            checkStatus('iframe add');
            newIframe.addEventListener("load",async()=>{
                checkStatus('iframe ready');
                await waitForElement1(newIframe,'.playbtnx');
                const videoIframeXX = await checkIframe(newIframe,'vsrcs');
                const videoIframeX = await checkIframe(videoIframeXX,'framesrc');
                checkStatus('videoIframe ready');
                await waitForElement1(videoIframeX,'.jw-media.jw-reset');
                videoIframeX.contentDocument.querySelector('video').currentTime=40;
                const message = { type: 'close_the_page'};
                chrome.runtime.sendMessage(message);
            }) 
        } catch (error) {
            console.log(error);
        }
    }
    info['newest'] = (data) => {
          const x = document.body.children.length;
          for(let i =0;i < x;i++){
              document.body.children[i].remove();
          }
          console.log('add iframe')
          const newIframe = document.createElement('iframe');
          newIframe.src = data.url;
          newIframe.style.height='400px';
          newIframe.style.width='400px';
          document.body.append(newIframe);
          setTimeout(()=>{
            if(b){
                window.location.reload();
            }
          },10000)
          newIframe.addEventListener('load',function(){b=false;frameLoaded()});
    }
    return info;
}

//newIframe.addEventListener('load',frameLoaded);
let noRestart = false;
let iX = 1;
const frameLoaded = () =>{
    clickInMiddleOfAllIframes(document,'');
}


function clickInMiddleOfAllIframes(doc,id) {
    const iframes = doc.querySelectorAll('iframe');
    for (let i = 0; i < iframes.length; i++) {
      const iframe = iframes[i];
      clickInMiddleOfIframe(iframe,id);
      // Recursively click in the middle of nested iframes
      clickInMiddleOfAllIframes(iframe.contentDocument || iframe.contentWindow.document,id);
    }
  }


 function clickInMiddleOfIframe(iframe,id) {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
    const iframeWidth = iframe.clientWidth || iframeDocument.body.clientWidth;
    const iframeHeight = iframe.clientHeight || iframeDocument.body.clientHeight;
    const middleX = iframeWidth / 2;
    const middleY = iframeHeight / 2;
    const clickEvent = new MouseEvent('click', {
      view: iframe.contentWindow,
      bubbles: true,
      cancelable: true,
      clientX: middleX,
      clientY: middleY,
    });
    const element = iframeDocument.elementFromPoint(middleX, middleY);
    if(element){
        iframeDocument.elementFromPoint(middleX, middleY).dispatchEvent(clickEvent);
        if( (iframeDocument.querySelector('video')|| (id && iframeDocument.querySelector('#'+id)) ) && !noRestart){
            iframeDocument.querySelector('video').currentTime=40;
            setInterval(()=>{
                const element = iframeDocument.elementFromPoint(middleX, middleY);
                if(element && iframeDocument.querySelector('video').paused){
                  iframeDocument.elementFromPoint(middleX, middleY).dispatchEvent(clickEvent);
                }
                if(!iframeDocument.querySelector('video').paused){
                    const message = { type: 'close_the_page'};
                    chrome.runtime.sendMessage(message);
                }
            },500);
            noRestart = true;
        }else if (!noRestart){
            setTimeout(()=>{
                clickInMiddleOfAllIframes(document,id);
            },500);
        }
    }else if(!noRestart){
        setTimeout(()=>{
            clickInMiddleOfAllIframes(document,id);
        },500);
    }
}

async function check_url() {
    const message = { type: 'check_url', data: { location: window.location.host ,fullLocation:window.location.href} };
    chrome.runtime.sendMessage(message);
    //console.log(await fetch(`https://rest.opensubtitles.org/search/imdbid-0068646`));
}

check_url();




