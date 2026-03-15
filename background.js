chrome.storage.local.set({ adsNumber: 0 });
chrome.runtime.onInstalled.addListener(() => {
  console.log("loaded new");
  chrome.storage.sync.set({ loggedIn: false });
  chrome.storage.local.set({ cta: undefined });
  chrome.storage.local.set({
    storedCategory: ["Lanzamientos", "Bajar de peso", "Hotmart"],
  });
  chrome.storage.local.set({ selectedCatg: undefined });
  chrome.storage.local.set({ chrome_extension_status: "inactive" }, () => {
    "set inactive by background";
  });
});

import "./loginbackground.js";

let token = "";

function checkUserLogin(e, o, t) {
  var r = t;
  chrome.cookies.get(
    { url: host + "/adspy/index.php", name: "jwt" },
    function (e) {
      var o = e && e.value ? e.value : 0;
      r({ farewell: o });
    }
  );
}
// console.log("background running");
let prevurl,
  host = "http://localhost",
  //adlibrary =
  /*  "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=%20%20%E2%A0%80%20&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all";*/
    adlibrary =
    "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all";

let urlWhenInstall = "https://clicspy.com/inicio-rapido/";

let urlWhenUpdate = "https://clicspy.com/updates/";

/*chrome.cookies.onChanged.addListener(function (e) {
  try {
    var o = host.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i),
      t = o && o[1];
    if (t) {
      let o = e.cookie.domain;
      if (-1 !== o.indexOf(t)) {
        let o;
        "jwt" == e.cookie.name &&
          ((o = e.removed ? 0 : e.cookie.value),
            chrome.storage.local.set({ jwt: o }, function () { }));
      }
    }
  } catch (e) {
    console.log("EXCEPTION :" + e.message);
  }
}),*/

//detectar cuando una URL cambia
chrome.webNavigation.onCommitted.addListener((details) => {
  const targetUrl = "www.facebook.com/ads/library/";

  // Check if the URL contains the desired path
  if (details.url.includes(targetUrl)) {
      console.log('Matched URL:', details.url);

      // Extract the query string parameter "q"
      const url = new URL(details.url);
      const keywords = url.searchParams.get('q');

      if (keywords) {
          console.log('Extracted keywords:', keywords);

          chrome.storage.session.get("token", function (result) {
            if (result.token === "init") {
              // no ha iniciado sesión, se le pide que inicie sesión
              sendResponse({
                message: "Por favor, para guardar el anuncio, inicia sesión.",
                error: true,
              });
            } else {
                  // Construct the API URL with the keywords parameter

                  const apiUrl = `https://test.tueducaciondigital.site/savekeywords?keywords=${encodeURIComponent(keywords)}`;
                            
                  // Perform the HTTP request
                  fetch(apiUrl, {
                    headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${result.token}`,
                        },
                      method: 'GET',
                  })
                  .then(response => {
                      if (!response.ok) {
                          throw new Error(`HTTP error! Status: ${response.status}`);
                      }
                      return response.json();
                  })
                  .then(data => {
                      console.log('API response:', data);
                  })
                  .catch(error => {
                      console.error('Error fetching from API:', error);
                  });              
              
            }
          });


          
          
      } else {
          console.log('No "q" parameter found in the URL.');
      }
  }
}, {
  url: [{schemes: ['http', 'https']}]
});

/*chrome.runtime.onInstalled.addListener(function (e) {
  if ("install" == e.reason) {
    chrome.tabs.create({ url: urlWhenInstall });
  } else if ("update" == e.reason) {
    chrome.tabs.create({ url: urlWhenUpdate });
  }
}),*/
  // chrome.runtime.setUninstallURL(host + "/adspy/chrome.php?uninstall=1"),
  chrome.runtime.onMessage.addListener(function (e, o, t) {
    //return "hello" == e.greeting && checkUserLogin(e, o, t), !0;
  });

let imagesBase64Urls = [];
chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse
) {
  console.log(request);

  if (request.msg === "download") {
    console.log(request.url);

    if (request.category === "image") {
      const imagesURLs = request.url;
      for (let i = 0; i < imagesURLs.length; i++) {
        try {
          const response = await fetch(imagesURLs[i]);
          const blob = await response.blob();
          // console.log(blob);

          const base64String = await blobToBase64(blob);
          // console.log(base64String);
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs
                .sendMessage(tabs[0].id, {
                  message: "baseUrl",
                  category: request.category,
                  base64url: base64String,
                  imgNo: i + 1,
                })
                .catch(console.log);
            }
          );
          imagesBase64Urls.push(base64String);
        } catch (e) {
          console.log(e);
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              chrome.tabs
                .sendMessage(tabs[0].id, { message: "error" })
                .catch(console.log);
            }
          );
        }
      }
    } else {
      const videoURLs = request.url;
      console.log("url video is", videoURLs[0]);
      var urlEncoded = encodeURIComponent(videoURLs[0]);
      //console.log("this is a video")
      const resourceUrl = urlEncoded;
      try {
        const response = await fetch(
          "https://nodeapi.tueducaciondigital.site/download?url=" + resourceUrl
        );
        const blob = await response.blob();
  
        // Convert the resource to base64
        const base64String = await blobToBase64(blob);
  
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          // Check if there is at least one active tab
          if (tabs && tabs[0]) {
            chrome.tabs
              .sendMessage(tabs[0].id, {
                message: "baseUrl",
                category: request.category,
                base64url: base64String,
              })
              .catch(console.log);
          } else {
            console.error("No active tab found.");
          }
        });  
      } catch (error) {
        chrome.tabs
                .sendMessage(tabs[0].id, { message: "error" })
                .catch(console.log);
      }
      


    }
  }
  else if(request.msg==="OpenLogin"){
    logoutAndOpenLogin();
  }
  else if(request.msg==="closeIfPopup"){
    //close the login popup window after 3 seconds if it was opened by the extension
    console.log("closeIfPopup", sender?.tab?.windowId, sender);
    let windowId = sender?.tab?.windowId;
    console.log("windowId", windowId);
    
    chrome.storage.local.get("loginPopupShowed", function (result) {
      console.log("loginPopupShowed", result);
      console.log("windowId", windowId);
      if (result.loginPopupShowed == windowId) {
        setTimeout(() => {
          chrome.windows.remove(windowId);
          chrome.storage.local.remove("loginPopupShowed");
        }, 3000);
      }
    })
  }
});

// Example of a simple user data object
const user = {
  username: "demo-user",
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  //console.log(request);
  let token = "";

  if (request.type === "getToken") {
    // get the token
    //console.log("requesting token");

    //sendResponse({message:"aqui esta su token desde background"})

    // Wait for the token to be retrieved from session storage
    chrome.storage.session.get("token", function (result) {
      if (result?.token) {
        sendResponse({
          message: "Token retrieved successfully",
          token: result.token,
        });
      } else {
        sendResponse({ message: "Token is empty", token: "" });
      }
    });

    return true; // indicate to Chrome that the response will be sent asynchronously
  }

  if (request.msg === "getTk") {
    // get the token
    console.log("requesting token from getTk");

    sendResponse({ message: "aqui esta su token desde background" });
  }

  if (request.greeting === "hellojon") {
    try {
      chrome.storage.session.get("token", function (response) {
        // Check if there was an error
        if (chrome.runtime.lastError) {
          console.log("hay un error obteniendo " + chrome.runtime.lastError);
          return;
        }
        console.log("the response getting token  is " + response.token);
        token = response.token;

        sendResponse({ message: token });
      });
    } catch (e) {
      console.log("error getting the token" + e);
    }
  }

  if (request.msg == "createToken") {
    //const saludo = getGreeting();
    //sendResponse({message:saludo});

    chrome.storage.session.set({ token: "init" }, function () {
      if (chrome.runtime.error) {
        console.error(chrome.runtime.error.message);
        return;
      }

      console.log("Data stored in session storage");
    });
    sendResponse({ message: "token is init" });
    return true; // indicate to Chrome that the response will be sent asynchronously
  }

  if (request.msg == "sendData") {
    console.log("the data is ", request.data);

    // Wait for the token to be retrieved from session storage
    chrome.storage.session.get("token", function (result) {
      if (result.token === "init") {
        // no ha iniciado sesión, se le pide que inicie sesión
        sendResponse({
          message: "Por favor, para guardar el anuncio, inicia sesión.",
          error: true,
        });
      } else {
        
        // inicia sesión se envia el request con los datos y el token
        sendRequest(request.data, result.token, "sendSingle")
          .then((result) => {
            console.log("sendRequest is ", result.message);

            sendResponse({
              error: result.error,
              message: `${result.message}`,
              token: result.token,
            });

            return result;
          })
          .catch((reason) => {
            console.log(reason);
            return false;
          });
      }
    });

    return true; // indicate to Chrome that the response will be sent asynchronously
  }
  if (request.msg == "sendBulkData") {
    console.log("sendBulkData");
    console.log(request.data);

    chrome.storage.session.get("token", function (result) {
      if (result.token === "init") {
        // no ha iniciado sesión, se le pide que inicie sesión
        sendResponse({
          message: "Por favor, para guardar el anuncio, inicia sesión.",
          error: true,
        });
      } else {
        // inicia sesión se envia el request con los datos y el token
        sendRequest(request.data, result.token, "sendBulk")
          .then((result) => {
            console.log("sendRequest is ", result.message);

            sendResponse({
              error: result.error,
              message: `${result.message}`,
              token: result.token,
            });

            return result;
          })
          .catch((reason) => {
            console.log(reason);
            return false;
          });
      }
    });
  }

  if (request.msg === "open_ads_library") {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].url.includes("facebook.com/ads/library")) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: function () {
            window.location.reload();
          },
        });
      } else {
        chrome.tabs.create({
          url: adlibrary,
          active: true,
        });
      }
    });
  }

  if(request.msg==="isSessionError"){
    chrome.storage.local.get("loginPopupShowed", function (result) {
      if (result.loginPopupShowed === sender.tab.windowId) {
        chrome.tabs.sendMessage(sender.tab.id, { type: "sessionError" });
      }
    });
  }
});

function logoutAndOpenLogin() {
  chrome.storage.local.clear();
  chrome.storage.sync.clear();
  chrome.storage.session.clear();

 

  chrome.windows.getCurrent((tabWindow) => {
    const width = Math.round(tabWindow.width * 0.5); // dynamic width
    const height = Math.round(tabWindow.height * 0.75); // dynamic height
    //const left = Math.round((tabWindow.width - width) * 0.5 + tabWindow.left);
    const left = Math.round((tabWindow.width - width) * 0.2 + tabWindow.left);
    const top = Math.round((tabWindow.height - height) * 0.5 + tabWindow.top);

    //remember the login popup window id
  
    chrome.windows.create(
      {
        focused: true,
        width: 450,
        height: 460,
        url: chrome.runtime.getURL("popup/popup.html"),
        type: "popup",
        left,
        top,
      },
      (subWindow) => {
        chrome.storage.local.set({ loginPopupShowed: subWindow.id });
      }
    );
  });
}

async function sendRequest(data, token, message) {
  console.log("the data is", data);
  console.log("the token is", token);

  let endPoint = "https://nodeapi.tueducaciondigital.site/dashboard";
  if (message == "sendBulk") {
    endPoint = "https://nodeapi.tueducaciondigital.site/bulk";
  }
  try {
    const response = await fetch(endPoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const responseDat = await response.json();
      console.log("response body is", responseDat);
      if (response.status >= 400 && response.status < 500) {
        console.log("response status IS", response.status)
        //excedio la capacidad de anuncios
        if(response.status === 403){
         
          return { error: true, message: responseDat.message + ". Contáctanos a soporte@pulpoia.com" };    
        }

        console.log("error 400");
        logoutAndOpenLogin();
      }
      return { error: true, message: responseDat.message };
    }

    const responseData = await response.json();
    console.log("response is", responseData);
    return responseData;
  } catch (e) {
    console.log("Error:", e);
    return { error: true, message: e.message };
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64String = reader.result;
      resolve(base64String.split(",")[1]);
    };
    reader.onerror = reject;
  });
}
