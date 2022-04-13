import optionsStorage from './options/options-storage.js';
import browser from 'webextension-polyfill';
import cache from 'webext-storage-cache';


async function main(details) {
	const options = await optionsStorage.getAll();
	const blacklistArray = options.blacklist.split("\n").filter(el => el !== "");
	const currentUrl = details.url;
	const currentTab = details.tabId;

	//console.log("current tab", currentTab);
	//console.log("current tab: ", currentUrl, " in bl: ", urlContains(currentUrl, blacklistArray))
	var tabCache = await cache.get(currentTab);
	var timeout = false
	if(tabCache != undefined) {
		timeout = tabcache.timeout
	}
	console.log("timeout: ",timeout);
	if (!timeout && urlContains(currentUrl, blacklistArray)) {
		//var tabCache = await cache.get(currentTab);
		//console.log("url contains ", currentTab);
		if(tabCache === undefined) {
			const newCache = await cache.set(currentTab, 
				{url: currentUrl, done:false, timeout: true},
				{minutes: parseInt(options.cacheTime)});
		}
		else if (tabCache.url != currentUrl) {
			await cache.set(currentTab, {url:currentUrl, done:false, timeout: true});
			tabCache = await cache.get(currentTab);
		}
		else if (tabCache.done === true) {
			return;
		}
		//console.log("cached url contains ", tabCache.url);
		console.log("cache contains ", tabCache);
		//console.log("cache doesn't include", currentTab);
		const triggerUrl = "https://www."+options.trigger+"*";
		//console.log("challenge triggered "+triggerUrl);
		browser.tabs.update(currentTab, {"url": "https://www."+options.challenge});
		browser.webRequest.onBeforeRequest.addListener( (details) => (
			sendUnblockMessage(details, triggerUrl)),
			{urls: ["https://*/*"]},	//listen to all and filter later
			);
		window.setTimeout(() => {
			//browser.tabs.update(tab.id, {"url": redirect.url})
			cache.set(currentTab, {url:currentUrl, done:false, timeout: false});
			console.log("end of timeout");
		}, 5000);
	}
	else {
		// No match on blacklist, don't do anything
	}
}


//const sendMessage = async function() {
//	const tab = await browser.tabs.getCurrent();
//	const msg = browser.runtime.sendMessage(tab.id)
//		.then(console.log)
//		.catch(console.log)
//}
function onGot(tabInfo) {
	  console.log(tabInfo);
}

function onError(error) {
	  console.log(`Error: ${error}`);
}

//async function sendUnblockMessage(requestDetails) {
const sendUnblockMessage = async (requestDetails, triggerUrl) => {
	if (requestDetails.url.search(triggerUrl)>=0) {
		//console.log("challenge completed");
		//const tab = await browser.tabs.getCurrent();
		//const tab = browser.tabs.getCurrent();
		const tab = await browser.tabs.query({active: true, windowId: browser.windows.WINDOW_ID_CURRENT})   
			.then(tabs => browser.tabs.get(tabs[0].id));
		//tab.then(onGot, onError);
		//const msg = browser.runtime.sendMessage(tab.id)
		const redirect = await cache.get(tab.id);
		await cache.set(tab.id, {url: redirect.url, done: true, timeout: false});
		//console.log("cache contains ", await cache.get(tab.id));
		return new Promise((resolve, reject) => {
			    window.setTimeout(() => {
						browser.tabs.update(tab.id, {"url": redirect.url})
					  //resolve({redirectUrl});
					}, 2000);
			  });
		//browser.tabs.update(tabId, {"url": redirect})
		browser.webRequest.onBeforeRequest.removeListener(sendUnblockMessage);
	}
}


function urlContains(url, keywords){
	var result = false;
	keywords.forEach(n => {
		if(url.includes(n)) {
			result = true;
		}
	})
	return result;
}


browser.webNavigation.onCommitted.addListener(main);
//browser.runtime.onMessage.addListener(unblockSite);

	//let url = window.location.href;
//if validated
//window.location.href = "https://www.duckduckgo.com"; // Redirect to website
//if www.clozemaster.com/assets/success-1118978015d1970bbcaf9eb439ebf57da701b6010bb49c7e3afe6713ef84f573.mp3
   //redirect

//if (window.location.protocol === 'http:') { // Insecure
//}
//  "content_scripts": [
//    {
//      "matches": ["*://*.google.com/*"],
//      "js": ["brainredirect.js"]
//    }
//  ]
