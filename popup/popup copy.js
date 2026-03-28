// tueducaciondigital.site / dashboard
(async () => {
  const { chrome_extension_status } = await chrome.storage.local.get(
    "chrome_extension_status"
  );
  console.log(chrome_extension_status);
  if (chrome_extension_status == "active") {
    document.getElementById("lib-toggle").checked = true;
  } else {
    document.getElementById("lib-toggle").checked = false;
  }
})();

// Initialize password visibility toggle on load (works regardless of login state)
(function initPasswordToggle(){
  try {
    const btn = document.getElementById('toggle-password');
    const input = document.getElementById('password');
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isHidden = input.getAttribute('type') === 'password';
      input.setAttribute('type', isHidden ? 'text' : 'password');
      btn.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
    });
  } catch (e) { /* ignore */ }
})();

chrome.storage.session.get(
  [
    "userStatus",
    "view",
    "pausaAuto",
    "Nombre",
    "Message",
    "email",
    "RemainingDays",
  ],
  async function (response) {
    console.log("local staroage getting llllllllllllllllllllllllllll");
    console.log(response);
    // Check if there was an error
    if (chrome.runtime.lastError) {
      console.log("hay un error obteniendo " + chrome.runtime.lastError);
      return;
    }

    // Get the value of userStatus
    //const pausaAuto = response.pausaAuto;

    const userStatus = response.userStatus;
    const { loggedIn } = await chrome.storage.sync.get("loggedIn");

    // Do something with the value of userStatus
    if (userStatus === true && loggedIn) {
      if (response.view == "form") {
        document.getElementById("login").style.display = "none";
        document.getElementById("form-toggle").style.display = "block";

        // Get a reference to the welcome message element
        const welcomeMsgElement = document.getElementById("welcomeMsg");

        // Modify the content of the element
        welcomeMsgElement.innerHTML = `Hola, <b>${
          response.Nombre || response.email
        }</b>`;

        // Get a reference to the welcome message element
        const trialMsgElement = document.getElementById("trialMsg");

        if (response?.RemainingDays && response.RemainingDays != "") {
          //trialMsgElement.innerHTML = `Te quedan , <b>${response.RemainingDays} días</b> de prueba`;
        } else if (response?.Message && response.Message != "") {
          trialMsgElement.innerHTML = response.Message;
        } else {
          document.getElementById("trialMsg").style.display = "none";
        }
      }
    } else {
      //apagamos la barra
      document.getElementById("lib-toggle").checked = !1;

      console.log("The user is not signed in.");
      document.getElementById("login").style.display = "block";
      chrome.runtime.sendMessage({ msg: "isSessionError" });
    }
  }
);

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "sessionError") {
    document.querySelector(".session-error").style.display = "block";
  }
});



//forgot pasword
document
  .getElementById("forgot-password-button")
  .addEventListener("click", function () {
    (document.getElementById("login").style.display = "none"),
      (document.getElementById("form-forgot-password").style.display = "block"),
      (document.getElementById("link-msg").innerHTML = "");
  });

//return-to-login-button
document
  .getElementById("return-to-login-button")
  .addEventListener("click", function () {
    (document.getElementById("login").style.display = "block"),
      (document.getElementById("form-forgot-password").style.display = "none"),
      (document.getElementById("link-msg").innerHTML = ""); //reset the display for forgot password messages
  });

//reset-password
document
  .getElementById("reset-password")
  .addEventListener("click", function () {
    forgotPassword();
  });

//logout-button
document.getElementById("logout-button").addEventListener("click", function () {
  chrome.storage.local.clear();
  chrome.storage.sync.clear();
  chrome.storage.session.clear();

  document.getElementById("login").style.display = "block";
  document.getElementById("form-toggle").style.display = "none";
});
//return to login from email sent screen
document
  .getElementById("return-to-login-from-reset")
  .addEventListener("click", function () {
    (document.getElementById("login").style.display = "block"),
      (document.getElementById("email-sent-screen").style.display = "none");
  });

document.getElementById("panel").onclick = function () {
  chrome.runtime.sendMessage({ type: "getToken" }, (res) => {
    if (res?.token) {
      window.open(
        `https://app.pulpoia.com/?token=${res?.token}`,
        "_blank"
      );
    } else {
      // alert("Por favor, inicia sesión para abrir el Panel")
      showSignInMessagePopup();
    }
  });
};

document.getElementById("library").onclick = function () {
  chrome.runtime.sendMessage({ type: "getToken" }, (res) => {
    
    if (res?.token) {
      /*window.open(
        `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=%20%20%E2%A0%80%20&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all`,
        "_blank"
      );*/
      window.open(
        `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&sort_data[direction]=desc&sort_data[mode]=relevancy_monthly_grouped&search_type=keyword_unordered&media_type=all`,
        "_blank"
      );
    } else {
      // alert("Por favor, inicia sesión para abrir el Panel")
      showSignInMessagePopup();
    }
  });
};

//forgot password request
const urlForgot = "https://pulpoia-ops.com/backend/nodeapi/forgotPassword";
async function forgotPassword() {
  console.log("forget password clicked to go to " + urlForgot);
  document.getElementById("invalid-mail").style.display = "none";
  fetch(urlForgot, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "*/*",
    },
    body: JSON.stringify({
      email: document.getElementById("input-email").value,
    }),
  })
    .then((response) =>
      response
        .json()
        .then((data) => ({
          dataServer: data,
          status: response.status,
        }))
        .then((res) => {
          dataProcessResponse(res.status, res.dataServer);
        })
    )
    .catch((response) => dataProcessResponse(response.status, response));
}

function dataProcessResponse(status, data) {
  console.log("status ", status);
  console.log("data ", data);
  let labelMsg = document.getElementById("invalid-mail");
  if (status === 200) {
    document.getElementById("form-forgot-password").style.display = "none";
    document.getElementById("email-sent-screen").style.display = "block";
  } else {
    labelMsg.style.display = "block";
  }
}

function changelinks() {
  $.ajax({
    url: r_user_note,
    headers: { "content-type": "text/plain;charset=UTF-8" },
    success: function (t) {
      "1" == t.success &&
        (t.mydata.adlib.changeAdlib
          ? $("#btn-adlibrary").attr("href", t.mydata.adlib.info)
          : t.mydata.moreads.changeMoreAds &&
            $(".more-ads").each(function () {
              $(this).attr("href", t.mydata.moreads.info);
            }));
    },
  });
}
function getdata(t, e = apilink) {
  getJwtStorage(function (n) {
    n && n.jwt
      ? $.ajax({
          url: e,
          origin: "*",
          type: "POST",
          data: formdata,
          headers: { Authorization: n.jwt },
          beforeSend: function () {
            $("#loadgif").removeClass("hidden");
          },
          success: function (e) {
            populate_data(e, t);
          },
          error: function (t, e) {
            401 == t.status
              ? ($("#ads-container").html(login_btn),
                (msg = "<br> Please Login and try again!"))
              : 403 == t.status
              ? ($("#ads-container").html(login_btn),
                (msg = "<p>Session Expired Please Login!!</p>"))
              : 402 == t.status
              ? ($("#ads-container").html(upgrade_btn),
                (msg = "<p>Please Upgrade Your Plan! </p>"))
              : 404 == t.status
              ? (msg = "Requested page not found. [404]")
              : 500 == t.status
              ? (msg = "Internal Server Error [500]..." + t.responseText)
              : (msg =
                  "parsererror" === e
                    ? "Requested JSON parse failed."
                    : "timeout" === e
                    ? "Time out error."
                    : "abort" === e
                    ? "Ajax request aborted."
                    : "Uncaught Error.\n" + t.responseText),
              $("#error-info").html(msg);
          },
          complete: function () {
            $("#loadgif").addClass("hidden");
          },
        })
      : $("#ads-container").html(login_btn);
  });
}
function timeAgo(t, e, n = "en-US") {
  var s = moment(t),
    a = moment(e);
  try {
    let e;
    const o = a.diff(s, "seconds"),
      i = Math.floor(o / 60),
      l = Math.floor(i / 60),
      r = Math.floor(l / 24),
      c = Math.floor(r / 30),
      d = Math.floor(c / 12),
      p = new Intl.RelativeTimeFormat(n, { numeric: "auto" });
    return (
      (e =
        d > 0
          ? p.format(0 - d, "year")
          : c > 0
          ? p.format(0 - c, "month")
          : r > 0
          ? p.format(0 - r, "day")
          : l > 0
          ? p.format(0 - l, "hour")
          : i > 0
          ? p.format(0 - i, "minute")
          : p.format(0 - o, "second")),
      e
    );
  } catch (e) {
    return t;
  }
}
function containsAnyLetter(t) {
  return /[a-zA-Z]/.test(t);
}
function populate_data(t, e) {
  var n = "",
    s = "";
  t.hasOwnProperty("error")
    ? (s = e
        ? "<h1 class='text-center'>No More Ads</h1>"
        : "<h1 class='text-center'>No Ads found </h1>")
    : t.ads.forEach((e) => {
        n += generate_div(e, t.now);
      }),
    e ? $("#ads-container").append(n) : $("#ads-container").html(n),
    $("#error-info").html(s);
}
function generate_div(t, e) {
  loaded++;
  var n,
    s = t.date_found,
    a = t.date_updated,
    o = "",
    i = "download",
    l = "",
    r = "",
    c = "",
    d = "",
    p = "",
    h = '<div class="col-lg-3 col-md-3 col-xs-6 col-card">',
    m = "",
    g = "",
    u = '<div class="clearfix visible-md visible-lg"></div>',
    v = '<div class="clearfix visible-xs visible-sm "></div>',
    b = "";
  page_ads = `<a title="More Ads By This Page" class="page-ads btn-action bc-darkblue" href="${host_front}/page.php?pid=${t.page_id}"  data-pid="${t.page_id}"   target="_blank" ><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-20 h-30px">\n  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />\n  </svg>\n  </a>`;
  var f = `<a title="Copy Ad link" class="copy-adlink db" data-attr="${host_front}/ad.php?adid=${t.id}"><i class="glyphicon glyphicon-link \n  mr-5 mu-shadow br-50 text-center hover-smooth whl-26 mr-5"><span class="popup hidden">Ad Link copied</span></i> \n Copy Ad Link </a>`;
  allads ||
    ((h = '<div class="col-sm-6 col-md-4 col-card">'),
    (u = ""),
    (b = '<div class="clearfix visible-md visible-lg"></div>'));
  if (
    (null != t.picked &&
      '<div class="hover-text"> <img class="w-30" src="../adspy/assets/badge-coin2.png"> <span class="tooltip-text left">Staff Picks</span></div>',
    t.video_link)
  ) {
    var x = t.video_link;
    t.video_link.startsWith("http") || (x = ".." + t.video_link);
    var w = t.thumbnail;
    t.thumbnail.startsWith("http") || (w = ".." + t.thumbnail),
      console.log("link:" + w),
      (o = ` <video class="w-100 mt-7" poster="${w}" src="${x}" alt="../adspy/assets/img/dog.jpg"  onerror="this.onerror=null;" controls preload="none" ></video>`),
      (n = x),
      (r = ` <a href="${t.thumbnail}" class="db" download="mythumbnail"  target="_blank"><i class="glyphicon glyphicon-download-alt \n    mr-5 mu-shadow br-50 text-center hover-smooth whl-26 mr-5"></i><span> \n    Save Thumbnail</span></a>`);
  } else
    (o = `  <img class="w-100 mt-7 " src="${t.thumbnail}" alt="../adspy/assets/img/dog.jpg" onerror="this.onerror=null;this.src='../adspy/assets/img/dog.jpg';" >`),
      (n = t.thumbnail),
      (i = "download='myimage'"),
      (l = `<a href="${n}" class="edit-btn db" ><i class="c-purple glyphicon glyphicon-scissors \n    mr-5 mu-shadow br-50 text-center hover-smooth whl-26 mr-5"></i> \n Edit Photo </a>`);
  var _ = "";
  if (t.cta_link) {
    (_ = `<a   title="Visit Website" class=" btn-action bc-pink cta_link" href="${t.cta_link}" target="_blank" rel="noreferrer"><i class="glyphicon glyphicon-new-window"></i></a>`),
      2 == t.ad_pl_id || 21 == t.ad_pl_id
        ? ((shopify_best_selling =
            new URL(t.cta_link).origin +
            "/collections//all?sort_by=best-selling"),
          (p = ` <a class="flex align-items-center" href="${shopify_best_selling}" target="_blank">\n      <div  class="img-parent flex  mu-shadow br-50 text-center hover-smooth whl-26 mr-10" >\n      <img src="${host_front}/assets/img/shopify-bag.png" class="p-5"/>\n  </div>\n  <span>Best Selling</span>\n  </a>`),
          (m = `<span title="Website uses Shopify" class=" mu-shadow br-50 text-center whl-25 img-parent mr-5"><img class="p-4" src="${host_front}/assets/svg/shopify.svg"/></span>`))
        : 4 == t.ad_pl_id
        ? (m = `<span title="Woo commerce" class=" mu-shadow br-50 text-center whl-25 img-parent mr-5"><img  src="${host_front}/assets/img/woo.png"/></span>`)
        : 11 == t.ad_pl_id
        ? (m = `<span title="Shoplaza" class=" mu-shadow br-50 text-center whl-25 img-parent mr-5"><img class="p-5" src="${host_front}/assets/img/shop.png"/></span>`)
        : 17 == t.ad_pl_id
        ? (m = `<span title="Xshoppy" class=" mu-shadow br-50 text-center whl-25 img-parent mr-5"><img class="p-4" src="${host_front}/assets/img/xshoppy.png"/></span>`)
        : 14 == t.ad_pl_id
        ? (m = `<span title="Youcan" class=" mu-shadow br-50 text-center whl-25 img-parent mr-5"><img src="${host_front}/assets/img/youcan.png"/></span>`)
        : 5 == t.ad_pl_id &&
          (m = `<span title="wix" class=" mu-shadow br-50 text-center whl-25 img-parent mr-5"><img class="p-2" src="${host_front}/assets/svg/wix.svg"/></span>`);
    var y =
      "https://www.similarweb.com/website/" + new URL(t.cta_link).hostname;
    g = ` <a class="flex align-items-center" href="${y}" target="_blank">\n    <div title="check traffic" class="img-parent flex  mu-shadow br-50 text-center hover-smooth whl-26 mr-10" >\n    <img class="p-5" src="https://res.cloudinary.com/crunchbase-production/image/upload/c_lpad,f_auto,q_auto:eco,dpr_1/v1497610848/vmx9yeps5gmipqztcxat.png"/>\n  </div>\n  <span>Website Traffic</span>\n  </a>`;
  }
  var $,
    k =
      ` <div class="flex flex-center page-container">\n                                  <div class="page-img">\n                                  \n                                    <img src="${
        t.p_img
      }"  onerror="this.onerror=null;this.src='https://i.pinimg.com/564x/4a/f0/c7/4af0c7a139b4a6199d7fb78c207629fa.jpg';">\n\n                                  </div>\n                                  <div>\n                                    <p>\n                                    <a title="Check page" class="page-title text-bold" target="_blank" href="https://web.facebook.com/${
        t.p_username
      }">${t.p_title.trim()} </a>\n                                    \n                                    </p>\n                                    <p><strong>Last Seen:</strong>\n                                    <span class="hover-text">` +
      timeAgo(a, e) +
      `\n                                    <span class="tooltip-text right"> ${a}</span>\n                                    </span>\n    \n    </p>\n                                  </div>\n                                </div>`,
    A = "Page on Ad Library";
  if (t.p_page_id) $ = "view_all_page_id=" + t.p_page_id + "&search_type=page";
  else if (containsAnyLetter(t.p_username) && /\d{14}/.test(C)) {
    var C = t.p_username,
      L = C.split("-").pop();
    $ = "view_all_page_id=" + L + "&search_type=page";
  } else {
    var S = t.p_title.replaceAll(" ", "%20");
    ($ = "q=" + S + "&search_type=keyword_exact_phrase"), (A = "Ad library");
  }
  const T = new Intl.DisplayNames(["en"], { type: "region" });
  var P = "",
    j = "",
    E = "none",
    M = "",
    B = "none",
    I = "",
    z = "";
  if (("ALL" != t.country && (j = T.of(t.country)), null != t.max_totalads)) {
    if (null != t.all_countries) {
      var D = t.all_countries.replaceAll("ALL, ", "");
      D.length > 0 && D.length > 3 && ((E = "block"), (P = D));
    }
    "ALL" != t.max_country &&
      ((I = T.of(t.max_country)),
      (z = ` in <span class="hover-text">${t.max_country} <span class="tooltip-text right">${I} </span></span>`)),
      t.country != t.max_country && (B = "block"),
      t.max_totalads != t.totalads && (B = "block");
  }
  t.a_twitter &&
    (M += `<span title="Twitter Conversion Installed" class="mu-shadow br-50 text-center whl-22 img-parent mr-5"><img  src="${host_front}/assets/svg/twitter.svg" class="p-3"></span>`),
    t.a_google_conversion &&
      (M += `<span title="Google Conversion Tag Detected" class="mu-shadow br-50 text-center whl-22 img-parent mr-5"><img  src="${host_front}/assets/svg/google_ads.svg" class="p-3"></span>`),
    t.a_snapchat &&
      (M += `<span title="Snapchat Pixel Detected" class="mu-shadow br-50 text-center whl-22 img-parent mr-5"><img  src="${host_front}/assets/svg/snapchat.svg" ></span>`),
    t.a_pinterest &&
      (M += `<span title="Pinterest Tag Detected"  class="mu-shadow br-50 text-center whl-22 img-parent mr-5"><img  src="${host_front}/assets/svg/pinterest.svg" ></span>`),
    t.a_tiktok &&
      (M += `<span title="Tiktok Pixel Detected"  class="mu-shadow br-50 text-center whl-22 img-parent mr-5"><img  src="${host_front}/assets/svg/tiktok.svg" ></span>`);
  var q =
      "https://web.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&" +
      $ +
      "&media_type=all",
    W =
      `\n     <div class="totalads-block">\n          <div class="ib">\n              <p class="f-purple text-lg text-bold">${t.totalads} ads <span class="text-xs">${j}</span></p>\n           </div>\n  <div class=" extra-block">\n  \n  <div class="flex justify-content-end mb-5 mt-5">\n  ${M}\n  </div>\n  ${m}\n\n  <div class="dropdown">\n    <!-- three dots -->\n    <span class="btn-action threedots" role="button"> <i class="glyphicon glyphicon-option-vertical"></i></span>\n    <!-- menu -->\n    <div  class=" myDropdown dropdown-content">\n  \n    ${r}\n    \n    ${p}\n    ${f} \n    ${g}\n    ${l}\n    </div>\n  </div>\n  </div>\n  </div>\n\n\n                      <div style="display:${E}">\n                      <p class="mb-5 text-etc text-elipsis"><strong>Countries: </strong>\n                      ${P}</p>\n                      </div>\n\n                      <div>\n\n                      <p><strong>Found:</strong>\n                        <span class="hover-text">` +
      timeAgo(s, e) +
      `\n                          <span class="tooltip-text right"> ${s}</span>\n                           </span>\n                        </p>\n                      </div>\n\n                      <div style="display:${B}">\n                      <p><strong title="Peak Ad count">Highest:</strong>\n                        <span class="f-purple ztext-md text-bold">${t.max_totalads} Active Ads </span>  <span class="hover-text">` +
      timeAgo(t.max_lastupdate, e) +
      `\n                        <span class="tooltip-text right"> ${
        t.max_lastupdate
      }</span> \n                        </span>\n                        ${z}\n                        </p>\n                      </div>\n                      \n                      <div class="mb-5 text-sm hidden">\n                      <p ><strong>ID:</strong>\n                      <span class="ad-id">${t.id
        .toString()
        .trim()}</span></p>\n                      </div>\n\n                      <!-- total ads -->\n                      \n                      <div class=" see-ad-div text-center mt-5">\n                      <a class="main-btns bc-grey text-w-500 text-xs" role="button" href="${q}" target="_blank">${A}<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class=" c-purple"><path stroke-linecap="round" stroke-linejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46"></path></svg>\n                      </a>\n                      <a class="btn-similar-ads main-btns bc-grey text-w-500 text-xs mt-5"   target="_blank" href="ad.php?adid=${
        t.id
      }" >Details <i class=" glyphicon glyphicon-chevron-right ml-5"></i> </a>\n                      </div>`,
    H =
      ` <div class="media-container pt-5">               \n                        <!-- text -->\n                        <div class="description-div">\n                            <span class="ztext-md text-w-400 description copy-text line-clamp-1" >${t.description} </span>\n                            <span class="copy-btn">\n                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-20 h-20">\n                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />\n                          </svg>\n                          \n                            <span class="popup mu-shadow hidden">Text copied</span> \n                            </span>\n                            <button class="btn-show-more p-0 text-md  text-bold border-none bc-transparent">Show more</button>\n                            \n                        </div>\n\n\n                        <!-- thumbnail -->\n                        <div>\n                          ` +
      o +
      "\n                        </div>\n      </div>",
    U = `<a title="Download" class="btn-action bc-lightblue" href="${n}" ${i} target="_blank" ><i class="glyphicon glyphicon-download-alt"></i></a>`;
  return (
    (h +=
      '\n                                    <div class="shadow-xs ad-card">\n                                  <!-- remove button -->\n    ' +
      c +
      "\n                                  <!-- end remove button -->\n                                  " +
      d +
      '\n                                        <div class="ad-header">\n                                            <!-- pageinfo -->\n                                          ' +
      k +
      "\n                                            <!-- endpageinfo -->\n\n \n                                          <!-- end ban page -->\n\n                                            <!-- Ads data -->\n                                          " +
      W +
      "\n                                            <!-- End Ads data -->\n                                        </div>\n\n                                        <!-- media container -->\n                                        " +
      H +
      '\n                                        <!-- end media container   -->\n\n                          <div class="w-100 ad-footer">\n                                        <!-- download btn -->\n                                        ' +
      U +
      "\n                                        <!-- end download btn -->\n                                 \n                                        <!-- visit website btn -->\n                                        " +
      _ +
      "\n                                        <!-- end visit website btn -->\n\n                                        " +
      page_ads +
      "\n\n                                        </div>\n                                    </div>\n                                </div>"),
    loaded % 4 == 0 && (h += u),
    loaded % 3 == 0 && (h += b),
    loaded % 2 == 0 && (h += v),
    h
  );
}
function showPopup() {
  $(this).find("span").first().removeClass("hidden");
  var t = this;
  setTimeout(function () {
    $(t).find("span").first().addClass("hidden");
  }, 800);
}
function copyToClipboard(t) {
  var e = document.createElement("textarea");
  document.body.appendChild(e),
    (e.value = t),
    e.select(),
    document.execCommand("copy"),
    document.body.removeChild(e);
}
async function setJwtCookie() {
  chrome.runtime.sendMessage({ greeting: "hello" }, function (t) {
    t && 0 !== t.farewell
      ? chrome.storage.local.set({ jwt: t.farewell }, function () {
          console.log("jwt is set .. ");
        })
      : console.log("ClicSpy: not logged in ...");
  });
}
function getJwtStorage(t) {
  chrome.storage.local.get("jwt", t);
}
var formdata,
  loaded = 0,
  host = "https://clicspy.com",
  host_front = host + "/adspy",
  apilink = host + "/api/media/getadbydomain.php";
let r_user_note = host + "/api/user/note.php";
const checkj = host + "/api/user/checkj.php";
var upgrade_btn = `<div class="text-center w-100"><a href="${host_front}/pricing.php" class="btn-purple pr-50 pl-50" target="_blank"> Upgrade Your Plan  <i class="glyphicon glyphicon-chevron-right"></i></a></div>`,
  login_btn = `<div class="text-center w-100"><a href="${host_front}/login.php" class="btn-purple pr-50 pl-50" target="_blank"> Login <i class="glyphicon glyphicon-chevron-right"></i></a></div>`,
  extension_status = !0,
  allads = !0;
$(document).on("click", ".btn-show-more", function () {
  $(this).siblings(".description").removeClass("line-clamp-1"),
    $(this).toggleClass("btn-show-more btn-show-less"),
    $(this).text("Show less");
}),
  $(document).on("click", ".btn-show-less", function () {
    $(this).siblings(".description").addClass("line-clamp-1"),
      $(this).toggleClass("btn-show-more btn-show-less"),
      $(this).text("Show more");
  }),
  document.querySelector("#lib-toggle").addEventListener("change", function () {
    try {
      // Query the active tab in the current window
      chrome.tabs.query(
        { currentWindow: true, active: true },
        async function (tabs) {
          // Check if the element with ID "lib-toggle" is checked
          var isChecked = document.getElementById("lib-toggle").checked;
          var activeTab = tabs[0];
          chrome.tabs
            .sendMessage(activeTab.id, { statusMessage: isChecked })
            .catch((error) => {
              if (isChecked)
                chrome.runtime.sendMessage({ msg: "open_ads_library" });
            });

          // //check if it is the first time the user is activating the extension
          // chrome.storage.local.get("is_not_first_time").then((result) => {
          //   if (!result.is_not_first_time) {
          //     chrome.storage.local.set({ is_not_first_time: true });
          //     chrome.runtime.sendMessage({ msg: "open_ads_library" });
          //   }
          //   //not the first time
          //   //now check if ads library is open
          //   else if (
          //     isChecked &&
          //     !activeTab.url.includes("facebook.com/ads/library")
          //   ) {
          //     chrome.runtime.sendMessage({ msg: "open_ads_library" });
          //   }
          // });

          // document.getElementById("lib-toggle").checked = isChecked;
          // Set the status in local storage based on the checked status
          if (isChecked) {
            chrome.storage.local.set(
              { chrome_extension_status: "active" },
              function () {
                // Update the checked status of the "lib-toggle" element
                console.log("checked:" + isChecked);
              }
            );
          } else {
            // await new Promise((rs, rj) => setTimeout(rs, 2000));
            chrome.storage.local.set(
              { chrome_extension_status: "inactive" },
              function () {
                // Update the checked status of the "lib-toggle" element
                console.log("storage inactive by checked");
              }
            );
          }
        }
      );
    } catch (error) {
      // Log any exceptions that occur
      console.error("An exception occurred: ", error);
    }
  }),
  // chrome.storage.session.get('token', function (result) {

  //   if (result?.token) {
  //     // sendResponse({ message: "Token retrieved successfully", token: result.token });
  //     chrome.storage.local.set({ status: true });
  //     document.getElementById("lib-toggle").checked = true;

  //   } else {
  //     // sendResponse({ message: "Token is empty", token: "" });
  //     chrome.storage.local.set({ status: false });
  //     document.getElementById("lib-toggle").checked = false
  //   }

  // });
  // chrome.storage.local.get("status", function (t) {
  //   console.log(t.status);
  //   void 0 !== t.status
  //     ? !0 === t.status
  //       ? ((document.getElementById("lib-toggle").checked = !0),
  //         console.log("status enabled beginnning"))
  //       : ((extension_status = !1),
  //         chrome.storage.local.set({ status: !1 }, function () {
  //           document.getElementById("lib-toggle").checked = !1;
  //         }),
  //         console.log("status disabled beginning "))
  //     : chrome.storage.local.set({ status: !0 }, function () {
  //       document.getElementById("lib-toggle").checked = !0;
  //     });
  // }),
  $(window).on("load", function () {
    chrome.tabs.query({ active: !0, lastFocusedWindow: !0 }, function (t) {
      try {
        var e = t[0],
          n = document.createElement("a");
        n.href = e.url;
        let s = n.hostname.match(
          /^(?:.*?\.)?([a-zA-Z0-9\-_]{3,}\.(?:\w{2,8}|\w{2,4}\.\w{2,4}))$/
        )[1];
        "string" == typeof s &&
          s.indexOf(".") > -1 &&
          ((document.getElementById("domainname").innerHTML = s),
          (formdata = { weblink: s }),
          extension_status
            ? getdata(!1)
            : $("#ads-container").html(
                "<p class='ztext-md text-center'>Please Activate The Extension !!</p>"
              ));
      } catch (t) {}
    });
  }),
  $(document).on("click", ".edit-btn", function (t) {
    t.preventDefault();
    var e = host_front + "/photoeditor.php?img=" + $(this).prop("href");
    window.open(e, "_blank");
  }),
  $(document).on("click", ".copy-btn", function () {
    var t = $(this).prev(".description").text();
    copyToClipboard(t), showPopup.call(this);
  }),
  $(document).on("click", ".copy-adlink", function () {
    var t = $(this).attr("data-attr");
    copyToClipboard(t), showPopup.call(this);
  }),
  $(document).on("click", ".threedots", function () {
    $(this).siblings(".myDropdown").first().toggleClass("showdrop");
  }),
  $(document).on("click", function () {
    $(this).hasClass("dropdown") ||
      $(this)
        .find(".showdrop")
        .each(function () {});
  }),
  (async () => {
    await setJwtCookie();
  })(),
  //changelinks();

  /*
      This is for the login form
  */
  document
    .querySelector(".mylogin-form")
    .addEventListener("submit", (event) => {
      event.preventDefault();
      const email = document.querySelector("#email").value;
      const pass = document.querySelector("#password").value;

      let errorMsg = document.getElementById("errorMsg");
      const progressBar = document.getElementById("login-progress");
      if (progressBar) progressBar.style.display = "inline-block";
      
      if (email === "" || pass === "") {
        errorMsg.innerHTML = "Usuario o contraseña no válido";
        if (progressBar) progressBar.style.display = "none";
        return;        
      }


  if (email && pass) {
        errorMsg.style.display = "none";
        const loginBtn = document.querySelector(".mylogin-button[type='submit']");
        if (loginBtn) loginBtn.disabled = true;

        chrome.runtime.sendMessage(
          { message: "login", payload: { email, pass } },
          function (response) {
            console.log("response is", response.error);

            if (response.error === false) {
            // Hide progress bar on success
              if (progressBar) progressBar.style.display = "none";
              if (loginBtn) loginBtn.disabled = false;              
              // if (true) {
              // Get a reference to the welcome message element
              const welcomeMsgElement = document.getElementById("welcomeMsg");
              const trialMsgElement = document.getElementById("trialMsg");

              // Modify the content of the element
              // console.log(response);
              //example response
              //   {
              //     "email": "df.jimenez120@gmail.com",
              //     "token": "rnKRMrkUCTV3B43yIHJ1",
              //     "customerInfo": {
              //         "Nombre": "Daniel Jimenez",
              //         "Message": "Te quedan <b>6</b> días de prueba",
              //         "Email": "df.jimenez120@gmail.com",
              //         "Active": true,
              //         "UserID": 1106,
              //         "IsValidUser": true
              //     },
              //     "error": false,
              //     "code": 200
              // }

              welcomeMsgElement.innerHTML = `Hola, <b>${
                response?.customerInfo?.Nombre || response.email
              }</b>`;
              if (response?.customerInfo?.Message) {
                trialMsgElement.innerHTML = response?.customerInfo?.Message;
              } else {
                trialMsgElement.style.display = "none";
              }

              // Get a reference to the div element.
              const myLogin = document.getElementById("login");
              const myMiningForm = document.getElementById("form-toggle");

              myLogin.style.display = "none";
              myMiningForm.style.display = "block";

              //store login info session
              // chrome.storage.local.set({ chrome_extension_status: 'inactive' });
              document.getElementById("lib-toggle").checked = 0;
              chrome.storage.session.set(
                { userStatus: true, view: "form" },
                function () {
                  // Check if there was an error
                  if (chrome.runtime.lastError) {
                    console.log(
                      "an error occurred " + chrome.runtime.lastError
                    );
                    return;
                  }

                  // The value of userStatus has been successfully set
                }
              );

              chrome.storage.session.get(["userStatus"], function (response) {
                // Check if there was an error
                if (chrome.runtime.lastError) {
                  console.log(chrome.runtime.lastError);
                  return;
                }

                // Get the value of userStatus
                const userStatus = response.userStatus;

                // Do something with the value of userStatus
                if (userStatus === true) {
                  console.log("The user is signed in.");
                  chrome.storage.sync.set({ loggedIn: true });
                  
                  //check if this is a popup created by the extension
                  chrome.runtime.sendMessage({ msg: "closeIfPopup" });
                } else {
                  console.log("The user is not signed in.");
                }
              });

            } else {
              console.log("el mensaje recibido es" + response);
              //display error message
                // Hide progress bar on error
                if (progressBar) progressBar.style.display = "none";
                if (loginBtn) loginBtn.disabled = false;

              errorMsg.innerHTML = response.message;
              errorMsg.style.display = "block";
            }
          }
        );
      }
    });

// (async () => {
//   const { loggedIn } = await chrome.storage.sync.get("loggedIn")
//   console.log("loggedIn Value");
//   console.log(loggedIn);
//   if (loggedIn) {
//     document.getElementById("form-toggle").style.display = "block";
//     document.getElementById("login").style.display = "none";
//   } else {
//     document.getElementById("form-toggle").style.display = "none";
//     document.getElementById("login").style.display = "block";
//   }

// })()
