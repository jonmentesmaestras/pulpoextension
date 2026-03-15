let extension_status = false;
let popupCategoryValue = undefined;
let robotCategoryValue = undefined;



let selectedNativeCategoryInfo = null; // To store the selected category details
let currentAdCardForNativePopup = null; // <--- ADD THIS LINE

let myToken = undefined;
let activePopup = null; // Global variable to track the active Tippy instance
let duplicatesAds = 0;
let userEnteredAds = 0;
let publisherPlatformValue;
let CTA = undefined;
(async () => {
  
  /** Common container for every in‑page popup */
  const LIBRARY_FILTER = () => document.getElementById("library-filter");

    //handle the active popup tippy
  function hideActivePopup() {
      if (activePopup) {
          activePopup.hide();
          activePopup.destroy(); // Destroy the active popup to allow for proper re-initialization
          activePopup = null;
      }
  }

  // This function will be the onSelect callback for loadCategories
  async function nativeUpdateName(event) { 
      const selectedLiElement = event.currentTarget; // Use event.currentTarget to get the <li> element

      // Clear previous selection styling
      const optionsBox = document.getElementById('nativeCategoryOptionsBox');
      if (optionsBox) {
          optionsBox.querySelectorAll(".category_name.selected").forEach(el => el.classList.remove("selected"));
      }

      // Apply selection styling to the current item
      if (selectedLiElement && selectedLiElement.classList) { // Added a check for classList
        selectedLiElement.classList.add("selected"); // This should now work
        selectedNativeCategoryInfo = {
          code: selectedLiElement.dataset.code,
          name: selectedLiElement.textContent.trim()
        };
        console.log("Native category selected:", selectedNativeCategoryInfo); // Check this log
      } else {
        console.error("ClicSpy Error: selectedLiElement is not a valid DOM element in nativeUpdateName.");
      }
  }

    // Function to show the native popup
    function showNativeCategoryPopup() {
      const overlay = document.getElementById('nativeCategoryPopupOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
      }
    }

    // Function to hide the native popup
    function hideNativeCategoryPopup() {
      const overlay = document.getElementById('nativeCategoryPopupOverlay');
      if (overlay) {
        overlay.style.display = 'none';
      }
      selectedNativeCategoryInfo = null; // Reset selected category
      // Optionally clear the optionsBox content if it's not cleared by beforeRender
      const optionsBox = document.getElementById('nativeCategoryOptionsBox');
      if (optionsBox) {
          optionsBox.innerHTML = '';
      }
    }

 // --- JavaScript for "Crear Categoría" Modal ---

  // Helper function to show the "Crear Categoría" modal
  function showCreateCategoryModal() {
    const modalOverlay = document.getElementById('clicspyCreateCategoryModalOverlay');
    const inputField = document.getElementById('clicspyNewCategoryNameInput');
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
      if (inputField) {
        inputField.value = ''; // Clear previous input
        inputField.focus();   // Focus on the input field
      }
    }
    // Hide the "Escoger Categoría" popup when "Crear Categoría" modal is shown
    // This assumes hideNativeCategoryPopup() correctly hides the "Escoger Categoría" popup
    hideNativeCategoryPopup();
  }

  // Helper function to hide the "Crear Categoría" modal
  function hideCreateCategoryModal() {
    const modalOverlay = document.getElementById('clicspyCreateCategoryModalOverlay');
    const inputField = document.getElementById('clicspyNewCategoryNameInput');
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
    }
    if (inputField) {
      inputField.value = ''; // Clear input on close
    }
  }    

  /* ------------------------------------------------------------------ */
  /*   Barra de progreso al guardar un anuncio                          */
  /* ------------------------------------------------------------------ */
  function showSavingBar(card){
    if(card.querySelector(".cspy-save-bar")) return;        // ya existe
    const bar = document.createElement("div");
    bar.className = "cspy-save-bar";
    bar.style.cssText = `
        position:absolute;top:0;left:0;height:4px;width:0;
        background:#6F58F4;z-index:3000;border-radius:4px 4px 0 0;
        transition:width 1.2s ease-in-out`;
    /* Aseguramos contexto relativo */
    card.style.position = card.style.position || "relative";
    card.prepend(bar);
    /* Animación: llena hasta 90 %, el 10 % final lo hacemos al recibir respuesta */
    requestAnimationFrame(()=>{ bar.style.width = "90%"; });
  }

  function hideSavingBar(card){
    const bar = card.querySelector(".cspy-save-bar");
    if(bar){
      bar.style.width = "100%";                 // completa animación
      setTimeout(()=>bar.remove(), 300);        // quita al terminar
    }
  }

  

  setToken();

  // alert(cta);
  setInterval(setToken, 1000);

  async function setToken() {
    try {
      myToken = await chrome.runtime.sendMessage({ type: "getToken" });
    } catch (e) {
      myToken = { token: "" };
    }
    if (myToken.token === "") {
      //does not work???
      //in background.js there is  no functionality to create token
      //token is only created at login

      // chrome.runtime.sendMessage({ msg: "createToken", token: "init" }, (res) => {
      //   console.log('response from createToken');
      //   console.log(res);
      //   if (res.message === 'token is init') {

      //   }
      // });

      if (
        document.getElementById("library-filter") &&
        document.getElementById("extension_status")
      ) {
        document.getElementById("library-filter").style.display = "none";
        // console.log('extesnion status removed');
        document.getElementById("extension_status").remove();
        showSignInMessagePopup();
      }
    } else {
      // console.log("the token is " + myToken.token);
    }
  }

  const { selectedCatg } = await chrome.storage.local.get("selectedCatg");
  let selectedMainCategory = selectedCatg;

  const robotInctive = chrome.runtime.getURL("./images/robot svg.svg");
  const robotActive = chrome.runtime.getURL("./images/robot active.svg");

  let to_date = undefined;
  let from_date = undefined;
  let logall = !1;
  let ad_status_value = undefined;
  const div = document.createElement("div");
  const myhost = "https://app.pulpoia.com/login";
  
  (async function () {
    function e(e) {
      try {
        if (logall && "string" == typeof e) {
          p.some((t) => {
            console.log('e function called');
            if (e.includes(t)) return !0;
          });
        }
      } catch (e) { }
    }
    async function t(t, n, a, i) {
      /*try {
        var o = await $.ajax({
          type: "POST",
          url: n,
          data: JSON.stringify(t),
          headers: { "content-type": "text/plain;charset=UTF-8" },
          beforeSend: function () { },
          success: function (e) {
            "1" == e.success && a && a(e, i);
          },
          error: function (t) {
            e("error:1 push_data  Response.Error => " + t.error + " on URL:" + n);
          },
        });
        return o;
      } catch (t) {
        e(t);
      }*/
    }
    // function n() {
    //   $.ajax({
    //     url: F,
    //     headers: { "content-type": "text/plain;charset=UTF-8" },
    //     success: function (t) {
    //       if ("1" == t.success) {
    //         t.mydata.note.shownote &&
    //           ($("#messagebar").first().html(t.mydata.note.info),
    //             $("#notebar").first().removeClass("hidden")),
    //           (J = t.mydata.removeoneuse),
    //           t.mydata.tags.changetags &&
    //           ((X = t.mydata.tags.ad_description),
    //             (G = t.mydata.tags.ad_thumbnail),
    //             (Y = t.mydata.tags.ad_card),
    //             (K = t.mydata.tags.content_div),
    //             (Q = t.mydata.tags.months_section),
    //             (Z = t.mydata.tags.tag_page_img_src_xpath),
    //             (ee = t.mydata.tags.tag_page_link_xpath),
    //             (te = t.mydata.tags.tag_launched_in)),
    //           (ne = t.mydata.disable.disabled),
    //           ne && showToolBar(!1);
    //         var n = t.mydata.disable.keepui;
    //         (R = t.mydata.numbers.mintopush),
    //           (z = t.mydata.numbers.minadpush),
    //           (oe = t.mydata.numbers.maxads);
    //         try {
    //           $("#adsnumber").attr("max", oe);
    //         } catch (t) {
    //           e(t);
    //         }
    //         n &&
    //           U &&
    //           (document.getElementById("library-filter").style.display =
    //             "block");
    //         var a = t.mydata.pauseSave;
    //         a && (ae = !0);
    //       }
    //     },
    //   });
    // }
    function a(t, n, a, i) {
      var o = "";
      return (
        xe(function (s) {
          s && s.jwt
            ? $.ajax({
              type: "POST",
              url: n,
              data: JSON.stringify(t),
              headers: {
                Authorization: s.jwt,
                "content-type": "text/plain;charset=UTF-8",
              },
              success: function (e) {
                if (((o = "Ad Favorited Successfully"), "1" == e.success))
                  return a && a(i), !0;
                o =
                  "2" == e.success
                    ? "Ad Already In Favorited List"
                    : "Saving the ad has failed!! ";
              },
              error: function (e, t) {
                if (401 == e.status || 403 == e.status)
                  return (
                    (msg = "Session Expired, Please Login Again!! "),
                    (o = msg),
                    (msg += "2:" + t),
                    !1
                  );
              },
              complete: function () {
                $("#popup_message").text(o),
                  $(".popup").first().addClass("show uptransition"),
                  setTimeout(function () {
                    $(".popup").first().removeClass("show uptransition");
                  }, 5e3);
              },
            })
            : e("Invalid JWT Please Login ");
        }),
        !1
      );
    }
    function i(t) {
      xe(function (n) {
        n &&
          n.jwt &&
          $.ajax({
            type: "POST",
            url: S,
            headers: {
              Authorization: n.jwt,
              "content-type": "text/plain;charset=UTF-8",
            },
            beforeSend: function () { },
            success: function (n) {
              "1" == n.success
                ? (t && t(!0), e("verified "))
                : (t && t(!1), e("Not valid "));
            },
            error: function (t) {
              e("error:1  " + t.error);
            },
          });
      });
    }
    async function o(n) {
      (A = null),
        (T = m(n)),
        T ? await t(T, k, le, n) : e("#### FAVORITE PAGE: Page is empty");
    }
    async function s(e) {
      P.push(e), ++B, B >= R && P.length > 0 && (t(P, _), (P = []), (B = 0));
    }
    function r(e) {
      for (
        var t,
        n = document.evaluate(e, document, null, XPathResult.ANY_TYPE, null),
        a = [];
        (t = n.iterateNext());

      )
        a.push(t);
      return a;
    }
    function l(e) {
      for (var t in e) return !1;
      return !0;
    }
    function d(t) {
      let n = "";
      try {
        if (t.id && t.totalads && t.thumbnail) return !1;
        t.id || (n = "Ad id is undefined "),
          t.totalads || (n += "Total Ads is undefined "),
          t.thumbnail || (n += " Ad thumbnail " + G + "is undefined "),
          t.description || (n += "Ad description " + X + " is undefined "),
          e("Warning: one of Ad params is null or undefined \n" + n);
      } catch (e) {
        void 0 === t.id &&
          (n += "#####extract Property#####: Ad ID is undefined"),
          void 0 === t.totalads &&
          (n += "\n#####:extract Property#####:: totalads is undefined"),
          void 0 === t.thumbnail &&
          (n +=
            "\n#####:extract Property#####:: " +
            G +
            " thumbnail is undefined"),
          void 0 === t.description &&
          (n +=
            "\n#####:extract Property#####:: " +
            X +
            " description is undefined"),
          console.log(
            "Warning: exception:5  one of Ad params is null or undefined =>" + n
          );
      }
      return console.log(t), !0;
    }
    function c(e) {

      let t = "";
      try {
        if (e.username && e.title && e.img) return !1;
        e.username || (t = "Page username is undefined "),
          e.title || (t += "Page title is undefined "),
          e.img || (t += "Page img is undefined "),
          console.log(
            "Warning: one of Page params is null or undefined \n" + t
          );
      } catch (n) {
        return (
          console.log(
            "Warning: exception:6 one of Page params is null or undefined => " +
            t
          ),
          void 0 === e.username &&
          (t +=
            "\n#####:extract Property#####:: Property username is undefined"),
          void 0 === e.title &&
          (t += "\n#####:extract Property: title is undefined"),
          void 0 === e.img &&
          (t += "\n#####:extract Property#####:: img is undefined"),
          !0
        );
      }
      return !0;
    }
    function u(e) {


      var t = null;
      $(e).find("span:contains(" + y[b].id + ")").each(function () {
        var e = $(this).text().replace(/\D/g, "");
        e.length > 10 && (t = e);
      });
      var n = 1;
      $(e).find(".totalads").each(function () {
        n = Number(
          $(this).text().slice(0, 4).replace(/[^0-9]/g, "")
        );
      });
      var a = null;
      $(e).find(X).each(function () {
        a = $(this).text().replace(/["']/g, "");
      });
      var i,
        o,
        s = null,
        r = $(e).find(G).each(function () {
          (o = $(this).attr("src")), (i = 2);
        });
      r.length ||
        $(e).find("video").each(function () {
          (i = 1), (o = $(this).attr("poster")), (s = $(this).attr("src"));
        });
      var c = null;
      $(e).find("a[target=_blank]").each(function () {
        var e = $(this).attr("href");
        e.includes("facebook.com/l.php?u=") &&
          ((c = decodeURIComponent(e.split("php?u=")[1].split("%3Ffb")[0])),
            (c = c.split("&h=")[0]));
      });
      var u = new URL(location.href);
      V = u.searchParams.get("country");
      var m = {
        id: t,
        totalads: n,
        description: a,
        type: i,
        thumbnail: o,
        video_link: s,
        cta_link: c,
        country: V,
      };
      return !l(m) && !d(m) && Object.keys(m).length >= 7 && m;
    }
    function m(e) {
      var t = {},
        n = new URL(location.href),
        a = n.searchParams.get("country");
      t.country = a;
      try {
        $(e).find(r(Z)).each(function () {
          let e = $(this).attr("src");
          e.toString().length > 15 && (t.img = e);
        }),
          $(e).find(r(ee)).each(function () {
            var e = document.createElement("a");
            e.href = $(this).attr("href");
            let n = e.pathname.replaceAll("/", "");
            -1 === n.indexOf("l.php") &&
              ((t.username = n),
                (t.title = $(this).find("span:eq(0)").text()));
          });
      } catch (e) {
        console.log("EXCEPTION 9");
      }
      return !c(t) && Object.keys(t).length >= 3 && t;
    }
    // function g(t) {
    //   t
    //     ? (e("Filter Enabled"),
    //       (U = !0),
    //       (q = !0),
    //       (document.getElementById("library-filter").style.display = "block")
    //       // (document.getElementById("enableFilter").checked = !0)
    //     )
    //     : (e("Filter disabled"),
    //       (U = !1),
    //       (q = !1),
    //       (document.getElementById("library-filter").style.display = "none")
    //       // (document.getElementById("enableFilter").checked = !1)
    //     );
    // }

    function h(e) {
      // $("#loading-div").toggleClass("hidden", !e).toggleClass("rotate", e);
    }

    function f(e) {
      (N = e), $(".favorite-button").toggleClass("visible", e);
    }
    const p = ["info", "function", "extract", "exception", "error"],
      v = (e) => e.replace(/[٠-٩]/g, (e) => "٠١٢٣٤٥٦٧٨٩".indexOf(e));
    var y = {
      en: {
        use_this: "use this cr",
        ads: "ads",
        active: "active days",
        see_more: "See More",
        id: "ID:",
        results: "results",
      },
      fr: {
        use_this: "utilisent ce contenu pu",
        ads: "publicités",
        active: "jours actifs",
        see_more: "Voir plus",
        id: "ID",
        results: "résultats",
      },
      de: {
        use_this: "verwenden diese Anzeigengestaltung",
        ads: "Werbeanzeigen",
        active: "Aktive Tage",
        see_more: "Mehr ansehen",
        id: "ID:",
        results: "Ergebnisse",
      },
      es: {
        use_this: "usan este contenido y",
        ads: "anuncios",
        active: "días activos",
        see_more: "Ver más",
        id: "Identificador",
        results: "resultados",
      },
      it: {
        use_this: "Inserzioni che usano questa",
        ads: "Annunci",
        active: "giorni attivi",
        see_more: "Altro",
        id: "ID:",
        results: "risultati",
      },
      pt: {
        use_this: "usam esse criativo e esse",
        ads: "anúncios",
        active: "dias ativos",
        see_more: "Ver mais",
        id: "Identificação",
        results: "resultados",
      },
      ru: {
        use_this: "Этот креатив и текст",
        ads: "объявлениях",
        active: "активные дни",
        see_more: "Ещё",
        id: "ID:",
        results: "Результаты",
      },
      tr: {
        use_this: "bu kreatifi ve metni",
        ads: "reklam",
        active: "aktif günler",
        see_more: "Daha Fazlasını Gör",
        id: "Kod:",
        results: "sonuç",
      },
      "zh-Hans": {
        use_this: "使用这个创意和文字",
        ads: "条广告",
        active: "活跃天数",
        see_more: "查看更多",
        id: "编号",
        results: "条结果",
      },
      ar: {
        use_this: " ",
        ads: " ",
        active: " ",
        see_more: "عرض المزيد",
        id: ": ",
        results: "نتيجة",
      },
      nl: {
        use_this: "gebruikt dit advertentiemateriaal",
        ads: "advertenties",
        active: "actieve dagen",
        see_more: "Meer weergeven",
        id: "ID:",
        results: "resultaten",
      },
      x: { use_this: " ", ads: " ", see_more: "", id: ": ", results: "~" },
    };
    let b;
    try {
      (b = document.getElementsByTagName("html")[0].getAttribute("lang")),
        console.log("Language :" + b),
        void 0 === y[b] && (b = "x"),
        console.log(y[b].use_this),
        console.log("EL TEXTO DE DUPLICADOS ES:", y[b].ads);
    } catch (e) {
      b = "x";
    }
    var x = !1;
    const _ = myhost + "/api/media/multicreate.php",
      k = myhost + "/api/page/create.php",
      E = myhost + "/api/favorited/createua.php",
      I = myhost + "/clicspy/favorite.php",
      w = myhost + "/clicspy/login.php",
      S = myhost + "/api/user/checkj.php";
    let A,
      T,
      dashbboard = myhost + "?token=",
      L = myhost + "/clicspy/index.php",
      F = myhost + "/api/user/note.php",
      P = [],
      j = [],
      B = 0,
      C = !1,
      O = 0,
      N = !1,
      z = 10,
      R = 2,
      q = !0,
      D = null,
      U = !0,
      M = null,
      W = location.href,
      H = 0,
      V = "ALL",
      J = !1,
      X = "div._7jyr",
      G = "img.x1ll5gia.x19kjcj4.xh8yej3",
      //Y = ".xh8yej3:not([class*=' '])", // tomamos toda la tarjeta
      Y = ".xh8yej3:has(> .x1plvlek)", // tomamos toda la tarjeta
      
      K = ".x1plvlek", // TOMAMOS LA PARTE DE ARRIBA DE LA TARJETA DE ADS (la que contiene el library id)
      //K = "._7jvw",
      
      Q = "x1plvlek.xryxfnj.x1gzqxud.x178xt8z.xm81vs4.xso031l.xy80clv.xb9moi8.xfth1om.x21b0me.xmls85d.xhk9q7s.x1otrzb0.x1i1ezom.x1o6z2jb.x1kmqopl.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x9f619", //todo el card del anuncio
          //x6s0dn4 x78zum5 x1q0g3np xozqiw3 x2lwn1j xeuugli x1iyjqo2 x19lwn94 xh8yej3
      // Q = ".x6s0dn4.x78zum5.xdt5ytf.xl56j7k.x1n2onr6.x1ja2u2z.x19gl646.xbumo9q",
      //Q = "._7jvw.x2izyaf.x1hq5gj4.x1d52u69",
      
      Z = "//div[1]/div[3]/div[1]/div[1]/div[1]//img[contains(@class, 'img')]",
      ee = "//div[1]/div[3]/div[1]/div[1]/div[1]/div[1]/div[1]//a[1]",
      te = ".xdbano7",
      ne = !1,
      ae = !1,
      ie = !1,
      prevousCards = undefined,
      oe = 40,
      se = !1;
    $(document).on("click", ".favorite-button", function (e) {
      alert("test test");
      h(!0),
        setTimeout(async () => {
          await o($(this).parent()), h(!1);
        }, 0);
    }),
      document.addEventListener("click", function (t) {
        e("info :  something clicked ");
      });
    const re = (e, t) => {
      (A = u(t)), A && ((A.page_id = e.data), s(A));
    },
      le = (e, t) => {
        (A = u(t)),
          A &&
          ((A.page_id = e.data),
            a(
              A,
              E,
              function (e) {
                $(e).find(".favorite-button").first().addClass("activestatus"),
                  console.log("user ads Favorited successfully ...");
              },
              t
            ));
      },
      de = (e) => {
        var t = e.getElementsByClassName("favorite-button");
        if (t.length <= 0) {
          e.classList.add("card-ad");
          var n = document.createElement("img");
          n.classList.add("favorite-button", "disabledstatus"),
            N && n.classList.add("visible"),
            (n.id = "fbuttonid"),
            e.prepend(n);
        }
      };
    // chrome.runtime.onMessage.addListener((t, n, a) => {
    //   try {
    //     "enablefilter" == t.command
    //       ? g(!0)
    //       : "disablefilter" == t.command
    //         ? g(!1)
    //         : e("error:2 received but not understanded");
    //   } catch (e) {
    //   } finally {
    //     return !0;
    //   }
    // }),
    chrome.storage.local.get("chrome_extension_status", function (e) {
      try {
        extension_status = e.chrome_extension_status;
        if (extension_status == "active") {
          const div = document.createElement("div");
          div.id = "extension_status";
          document.body.append(div);
        }
        showToolBar("inactive" !== e.chrome_extension_status);
      } catch (e) { }
    });

    const ce = (e, t) => {
      setInterval(() => {
        if (location.href !== W) {
          (W = location.href), (H = 0);
          var n = new URL(location.href);
          (V = n.searchParams.get("country")), t(), e();
        }
        he();
      }, 1e3);
    };
    if (
      -1 !== location.href.toString().indexOf("facebook.com/ads/") &&
      -1 == location.href.toString().indexOf(".com/ads/manager/")
    ) {
      try {
        {
          let a = 0,
            o = !1,
            s = !1,
            l = !1;


          // const adsNumberResult = await chrome.storage.local.get('adsNumber')
          // const adsNumber = adsNumberResult.adsNumber;
          // let num = parseInt(adsNumber)
          // console.log("num" + num);
          const rocketInactive = chrome.runtime.getURL(
            "./images/rocket svg.svg"
          );
          const rocketActive = chrome.runtime.getURL(
            "./images/rocket active.svg"
          );

          let d = 0;
          var ue = document.createElement("div");
          (ue.id = "library-filter"),
            (ue.style.display = "none"),
            (ue.innerHTML = `
          <div id="notebar" class="centerFlex hidden">
        <div id="messagebar">Nothing Here ...\n </div>
        <button id="hidebtn">X</button>
    </div>\n
    <div> <svg xmlns="http://www.w3.org/2000/svg" id="loading-div" class="loading-div hidden" fill="none"
            viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" aria-hidden="true">\n <path stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15">
            </path>\n </svg>
    </div>\n
    <div class="popup  "> <span id="popup_message">Hello world Message here</span>
    </div>\n
    <div dir="ltr" lang="en" class="navfilter centerFlex showExtend" style="color:white">
            Por favor maximiza la ventana
    </div>
    <div dir="ltr" lang="en" class="navfilter centerFlex">\n <a class="logo" style="display:flex; align-items:center" href="${myhost}">\n <img id="logo"
                src="images/newLogo.png" alt="clicspy.com">\n </a> \n <div class="rangeinput centerFlex divblock">\n
            <label for="adsnumber" style="font-family:'Montserrat', sans-serif;"># Ads:</label>\n <input id="adsnumber"
                type="range" style="width:130px" value="0" min="0" max="40"  />\n <output
                id="rangevalue">OFF</output>\n\n
        </div>\n
    
        <div class="centerFlex divblock" style="display:none !important">\n <label for="enableFilter"
                style="font-family:'Montserrat', sans-serif;">FILTRO</label>\n \n </div>\n 
    
        <div class="centerFlex divblock" style="display: none;">\n
        
        <img src="${rocketInactive}" class="control-icon inactive" id='rocket' alt="">

        </div>\n

        <div class="centerFlex divblock" style="display: none;">\n
        
        <img src="${robotInctive}"  class="control-icon inactive" id='robot' alt="">

        </div>\n
    
        <div class="centerFlex divblock">\n <label for="enableScroll"
                style="font-family:'Montserrat', sans-serif;">Scroll</label>\n <input class="toggle" type="checkbox"
                id="enableScroll" name="toggle-lib-scroll" />\n\n
        </div>\n
    
    
      
        <div class="centerFlex divblock newFilter" id="selectStatus">\n 
         
              <label for="selectStatus" style="text-overflow: ellipsis; white-space: nowrap;
              overflow: hidden;font-family:'Montserrat',sans-serif; cursor: pointer;  color:black;font-size:10px !important">
                  ${replaceStatusValue2()}
              </label>\n
              <img src="${chrome.runtime.getURL(
              "./images/icons8-menu.svg"
            )}" style="display:none"   style="width:20px">
          
        </div>\n
    
    
        <div class="divblock countryFilter" id="selectCountry" >\n 
    
          <label style="display:none">Pais</label>
          
          <label for="selectCountry" style="font-family:'Montserrat', sans-serif;">

            <span class="flag-icon"><img src='${chrome.runtime.getURL(
              "./flags/" + getCountryCode().toLowerCase() + ".svg"
            )}'></span>

          </label>
         <span style="font-size:10px;font-weight:bold;font-family:sans-serif;" class="country-name" id="country_name">${getCountryName()}</span>
          <img style="display:none"  src="${chrome.runtime.getURL(
              "./images/country-menu.svg"
            )}" id="selectCountry"  style="width:20px;cursor:pointer;">
         
        </div>\n


        <div class="centerFlex divblock languageBlock" id="selectLanguage">\n 
          <img src=${chrome.runtime.getURL("./images/language-icon.svg")} class='language-icon' />
          <label for="selectMediaType" style="font-family:'Montserrat',sans-serif; cursor: pointer;  color:black;font-size:10px !important">
           Idioma
          </label>\n
      
        </div>\n


        <div class="centerFlex divblock mediaTypeBlock" id="selectMediaType">\n 
         
          <label for="selectMediaType" style=" text-overflow: ellipsis;white-space: nowrap;
          overflow: hidden; font-family:'Montserrat', sans-serif; cursor: pointer;  color:black;font-size:10px !important">
              ${replaceMedia() || "Todos los Contenidos"}
          </label>\n
      
        </div>\n

        <div class="centerFlex divblock plateformBlock" id="selectplateform">\n 
         
              <label for="selectplateform" style="text-overflow: ellipsis;white-space: nowrap;
              overflow: hidden; font-family:'Montserrat', sans-serif; cursor: pointer;  color:black;font-size:10px !important">
                  ${replacePlateform() || "Todas de URL"}
              </label>\n
            
        </div>\n

       
    
    
        <div class="date-picker">\n 
         <input type="date" id="from_date" ${getStartDateMinValue()} style="width:60px;border:0px;background-color:white;padding-left:3px;padding-right:3px; border-radius:10px;height:20px;font-size:9px">
        </div>\n
    
        <div class="date-picker">\n 
        <input type="date" id="to_date" ${getStartDateMaxValue()} style="width:60px;border:0px;background-color:white;padding-left:3px;padding-right:3px; border-radius:10px;height:20px;font-size:9px">
        </div>\n
    
    
    
        <div class="centerFlex divblock" style="display:none !important">\n <label for="all-months" style="font-family:'Montserrat', sans-serif;">
        MESES</label>\n <input class="toggle" type="checkbox" id="all-months" />\n </div>
      \n \n <div
            class="centerFlex divblock">\n <div style="display:none">
             <label
                    title="removes hidden ads and boosts page speed" for="removehidden">Remove hidden</label>\n <input
                    class="toggle" type="checkbox" id="removehidden" /></div>\n </div>\n <div class="centerFlex divblock">\n 
               <button id="panel" style="margin-right:10px" >\n

                Panel\n </button>\n\n 
                
            </div>\n <img  src="${chrome.runtime.getURL(
              "./images/up_arrow.png"
            )}" id="scrollToTopBtn" class="up_arrow"/>\n\n
    </div>
    
    <div id="nativeCategoryPopupOverlay" class="native-popup-overlay">
      <div id="nativeCategoryPopup" class="native-popup-content">
        <div class="native-popup-header">
          Escoger Categoría <span id="closeNativeCategoryPopup" class="native-popup-close-btn">&times;</span>
        </div>
        <div id="nativeCategoryOptionsBox" class="native-popup-options-box">
          </div>
        <div class="native-popup-footer">
          <div style="display: flex; align-items: center;">
            
            <button id="footerCreateCategoryBtn" class="native-popup-footer-btn" style="background: none; border: none; cursor: pointer; display: flex; align-items: center; padding: 0;">
              <span class="plus-icon" style="font-size: 32px; font-weight: bold; margin-right: 8px; color: #444;">+</span>
              <span style="font-size: 18px; font-weight: bold; color: #333;">Crear Categoría</span>
            </button>
          </div>
          <button id="nativeCategoryIniciarBtn" class="native-popup-iniciar-btn">Guardar</button>
        </div>
      </div>
    </div>    


    <!-- crear category window -->
    <div id="clicspyCreateCategoryModalOverlay" class="clicspy-modal-overlay" style="display: none;">
      <div class="clicspy-modal-content">
        <div class="clicspy-modal-header">
          <h2 style="margin: 0; font-size: 22px; font-weight: 600;">Crear Categoría</h2>
          <button id="clicspyCloseCreateCategoryModalBtn" class="clicspy-modal-close-btn" title="Cerrar">&times;</button>
        </div>
        <div class="clicspy-modal-body">
          <label for="clicspyNewCategoryNameInput" style="display: block; margin-bottom: 8px; font-size: 16px; color: #333;">Escriba el nombre de la nueva categoría</label>
          <input type="text" id="clicspyNewCategoryNameInput" class="clicspy-modal-input" placeholder="Nombre de la categoría" />
        </div>
        <div class="clicspy-modal-footer">
          <button id="clicspySubmitNewCategoryBtn" class="clicspy-modal-button clicspy-modal-button-primary">Crear</button>
        </div>
      </div>
    </div>        


          `),
            (ue.style.zIndex = "2000");
          
            /** aqui todos los popup.show */
          


          var me = chrome.runtime.getURL("images/newlogo.png");
          $(ue).find("#logo").first().attr("src", me),
            document.body.appendChild(ue)
            
            /* LISTENERS */
            // implementacion del botón de guardar
            if (document.getElementById("nativeCategoryIniciarBtn")) {
                document.getElementById("nativeCategoryIniciarBtn").addEventListener("click", async () => {
                    console.log("ClicSpy: Guardar botón clickeado en el popup nativo");
                    if (!selectedNativeCategoryInfo || !selectedNativeCategoryInfo.code) {
                       console.log("ClicSpy Error: NO SE SELECCIONO CATEGORIA selectedNativeCategoryInfo is not set or invalid.");
                        MessagePopup("Por favor seleccione una categoría"); // Your existing MessagePopup
                        return;
                    }

                    if (!currentAdCardForNativePopup) {
                        console.error("ClicSpy Error: Ad card context (n) not found for native popup save.");
                        MessagePopup("Error: No se pudo identificar el anuncio para guardar.");
                        // It's also good practice to hide the popup if there's a critical error like this
                        hideNativeCategoryPopup();
                        return;
                    }

                    try {
                        const { loggedIn } = await chrome.storage.sync.get("loggedIn");
                        if (loggedIn) {
                            const adCardToSave = currentAdCardForNativePopup; // Use the stored ad card context

                            // Ensure getAdData can correctly process adCardToSave
                            const data = getAdData(adCardToSave, selectedNativeCategoryInfo.code);
                            
                            if (data) { // Check if getAdData returned valid data
                                showSavingBar(adCardToSave); // Your existing showSavingBar
                                sendPostRequest(data, adCardToSave); // Your existing sendPostRequest
                            } else {
                                console.error("ClicSpy Error: getAdData failed to extract data for ad:", adCardToSave);
                                MessagePopup("Error al procesar los datos del anuncio.");
                            }

                            hideNativeCategoryPopup(); // Your existing function to hide the popup
                            
                            // Optional: Reset the context after use, though it will be overwritten
                            // when the next ad's category button is clicked.
                            // currentAdCardForNativePopup = null; 
                            // selectedNativeCategoryInfo = null; // Reset selected category info as well

                        } else {
                            logInMessage("Por favor haz clic el ícono de la extensión que se encuentra en esta misma pestaña, en la esquina superior derecha para iniciar sesión"); // Your existing logInMessage
                            // Optionally hide the popup if login is required but not done
                            // hideNativeCategoryPopup(); 
                        }
                    } catch (error) {
                        console.error("ClicSpy Error during native category save:", error);
                        MessagePopup("Ocurrió un error al guardar el anuncio.");
                        hideNativeCategoryPopup(); // Hide popup on error
                    }
                });
            } else {
                console.error("ClicSpy Error: No se encontró el botón #nativeCategoryIniciarBtn en el DOM.");
            }            

            // Implementación del botón de cierre para el popup nativo
            if (document.getElementById("closeNativeCategoryPopup")) {
              document.getElementById("closeNativeCategoryPopup").addEventListener("click", () => {
                // Llama a tu función existente que oculta el popup y resetea la info
                hideNativeCategoryPopup();
              });
            } else {
              // Este console.error es útil si alguna vez el ID cambia o el elemento no se renderiza
              console.error("ClicSpy Error: No se encontró el botón de cierre del popup nativo con ID #closeNativeCategoryPopup");
            }

            // Event Listener for the button that OPENS the "Crear Categoría" modal
            // This button (#footerCreateCategoryBtn) is in the footer of the "Escoger Categoría" popup
            // Ensure this listener is added after ue.innerHTML is set and #footerCreateCategoryBtn exists
            const openCreateModalBtn = document.getElementById('footerCreateCategoryBtn');
            if (openCreateModalBtn) {
              openCreateModalBtn.addEventListener('click', () => {
                showCreateCategoryModal();
              });
            } else {
              console.error('ClicSpy Error: Button #footerCreateCategoryBtn not found.');
            }

            // Event Listener for the CLOSE button (×) inside the "Crear Categoría" modal
              const closeCreateModalBtn = document.getElementById('clicspyCloseCreateCategoryModalBtn');
              if (closeCreateModalBtn) {
                closeCreateModalBtn.addEventListener('click', async () => { // Made the callback async
                  hideCreateCategoryModal(); // Hide the "Crear Categoría" modal

                  // Show the "Escoger Categoría" popup
                  // Ensure showNativeCategoryPopup() is defined and works correctly
                  showNativeCategoryPopup();

                  // Refresh the category list in the "Escoger Categoría" popup
                  const optionsBox = document.getElementById('nativeCategoryOptionsBox');
                  if (optionsBox && typeof loadCategories === 'function' && typeof nativeUpdateName === 'function') {
                    try {
                      // Clear previously selected category info from the "Escoger Categoría" popup perspective if needed
                      // selectedNativeCategoryInfo = null; // Uncomment if you want to force re-selection

                      console.log('Refreshing categories in Escoger Categoría popup...');
                      await loadCategories({
                        container: optionsBox,
                        onSelect: nativeUpdateName, // Your existing onSelect handler for the "Escoger Categoría" list
                        beforeRender() {
                          // This function should clear the existing items from optionsBox
                          if (optionsBox) {
                            optionsBox.querySelectorAll(".category_name").forEach(el => el.remove());
                          }
                        }
                      });
                    } catch (error) {
                      console.error('ClicSpy Error: Failed to refresh categories in Escoger Categoría popup:', error);
                      // Optionally, inform the user if the refresh fails, though it might be a silent failure.
                      // MessagePopup('No se pudo actualizar la lista de categorías.');
                    }
                  } else {
                    console.warn('ClicSpy Warning: Could not refresh category list. Required elements or functions (loadCategories/nativeUpdateName) not found.');
                  }
                });
              } else {
                // This console.error should already be in your code from the previous step
                console.error('ClicSpy Error: Button #clicspyCloseCreateCategoryModalBtn not found.');
              }

            // Event Listener for the SUBMIT ("Crear") button inside the "Crear Categoría" modal
            const submitNewCategoryBtn = document.getElementById('clicspySubmitNewCategoryBtn');
            if (submitNewCategoryBtn) {
              submitNewCategoryBtn.addEventListener('click', async () => {
                const newCategoryNameInput = document.getElementById('clicspyNewCategoryNameInput');
                if (!newCategoryNameInput) {
                  console.error('ClicSpy Error: Input field #clicspyNewCategoryNameInput not found.');
                  MessagePopup('Error interno al crear categoría.');
                  return;
                }

                const categoryName = newCategoryNameInput.value.trim();

                if (categoryName === '') {
                  MessagePopup('Por favor ingrese un nombre para la categoría.');
                  newCategoryNameInput.focus();
                  return;
                }

                submitNewCategoryBtn.disabled = true;
                submitNewCategoryBtn.textContent = 'Creando...';

                try {
                  const response = await postCategory(categoryName); // Your existing function

                  if (response && response.error === false && response.status === 200) {
                    MessagePopup(response.message || 'Categoría creada exitosamente.');
                    setTimeout(function() {
                      console.log("3 seconds have passed");
                    }, 3000); // 3000 milliseconds = 3 seconds

                    
                    hideCreateCategoryModal(); // Hide the "Crear Categoría" modal

                    // --- REFACTORED PART: Show the "Escoger Categoría" popup ---
                    showNativeCategoryPopup(); // Ensure this function is defined and correctly shows the popup

                    // Refresh the category list in the "Escoger Categoría" popup (this logic was already here)
                    const optionsBox = document.getElementById('nativeCategoryOptionsBox');
                    if (optionsBox && typeof loadCategories === 'function' && typeof nativeUpdateName === 'function') {
                      selectedNativeCategoryInfo = null; // Clear previous selection from "Escoger Categoría"
                      console.log('Refreshing categories in Escoger Categoría popup after creation...');
                      await loadCategories({
                        container: optionsBox,
                        onSelect: nativeUpdateName,
                        beforeRender() {
                          if (optionsBox) {
                            optionsBox.querySelectorAll(".category_name").forEach(el => el.remove());
                          }
                        }
                      });
                    } else {
                      console.warn('ClicSpy Warning: Could not refresh category list after creation. Elements/functions not found.');
                    }
                  } else {
                    MessagePopup(response.message || 'Error al crear la categoría. Intente nuevamente.');
                  }
                } catch (error) {
                  console.error('ClicSpy Error creating category:', error);
                  MessagePopup('Error al crear la categoría: ' + (error.message || 'Error desconocido'));
                } finally {
                  submitNewCategoryBtn.disabled = false;
                  submitNewCategoryBtn.textContent = 'Crear';
                }
              });
            } else {
              console.error('ClicSpy Error: Button #clicspySubmitNewCategoryBtn not found.');
            }                     

            // Optional: Close modal if user clicks outside the modal content (on the overlay)
            const modalOverlay = document.getElementById('clicspyCreateCategoryModalOverlay');
            if (modalOverlay) {
              modalOverlay.addEventListener('click', (event) => {
                if (event.target === modalOverlay) { // Check if the click was directly on the overlay
                  hideCreateCategoryModal();
                }
              });
            }

            // --- End of JavaScript for "Crear Categoría" Modal ---            

              



            (document.getElementById("scrollToTopBtn").onclick = function () {
              a && clearInterval(a);
              var e = document.documentElement;
              e.scrollTo({ top: 0, behavior: "smooth" });
            }),
           /* (document.getElementById("robot").onclick = async function (e) {
              const robotIcon = e.target;
              if (robotIcon.classList.contains("active")) {
                robotIcon.setAttribute("src", robotInctive);
                robotIcon.classList.remove("active");
                chrome.storage.local.set({ robotStatus: "inactive" });
              } else {
                let popup = categoryPopup();
                popup.show();
              }
            });*/
          /*(document.getElementById("robot").onclick = async function (e) {
            const robotIcon = e.target; // This is document.getElementById("robot")

            if (robotIcon.classList.contains("active")) {
              // Deactivating robot
              robotIcon.setAttribute("src", robotInctive); // Ensure robotInctive is defined
              robotIcon.classList.remove("active");
              chrome.storage.local.set({ robotStatus: "inactive" });
              
              // Destroy its tippy instance if it exists and is shown
              // Check if it's the globally activePopup or just attached to the robotIcon
              if (activePopup && activePopup.reference === robotIcon) {
                  hideActivePopup(); // This will hide and destroy it
              } else if (robotIcon._tippy && robotIcon._tippy.state.isShown) {
                  // If not managed by activePopup system but still shown, destroy it
                  robotIcon._tippy.destroy();
              }

            } else {
              // User wants to activate the robot, which requires showing the category selection popup

              // 1. Hide/Destroy any other currently active tippy popup
              hideActivePopup();

              // 2. Explicitly destroy any tippy instance that might still be lingering on robotIcon
              //    This is a safety net before categoryPopup tries to create a new one.
              if (robotIcon._tippy) {
                  robotIcon._tippy.destroy();
              }

              // 3. Create and show the category popup
              let newRobotPopup = categoryPopup(); // categoryPopup() will now also ensure it's a fresh instance
              
              // 4. Show the new popup and register it as the active one
              setTimeout(() => { // Use a small delay for stability
                  if (newRobotPopup && typeof newRobotPopup.show === 'function') {
                      newRobotPopup.show();
                      activePopup = newRobotPopup; // Manage it with the global activePopup system
                  }
              }, 10);
            }
          });*/

          
          /*document.getElementById("selectStatus").onclick = function () {
            let popup = statusPopup();
            popup.show();
          };*/

         


          document
            .getElementById("adsnumber")
            .addEventListener("input", function (e) {
              if (e.target.value != 0) {
                document.getElementById("rangevalue").innerText =
                  e.target.value;
              } else {
                document.getElementById("rangevalue").innerText = "OFF";
              }
            });

          const { loggedIn } = await chrome.storage.sync.get("loggedIn")
          if (loggedIn == false) {
            document.querySelector('#panel').innerText = "Login";
          }
          chrome.storage.onChanged.addListener(function (changes, area) {
            // console.log('Logged in sync storage value is changed');
            // console.log(changes);
            // console.log(changes?.loggedIn);
            // console.log(changes?.loggedIn?.newValue == false);
            // console.log(changes?.loggedIn && changes?.loggedIn?.newValue === false);
            if (changes?.loggedIn && changes?.loggedIn?.newValue === false) {
              // alert('logged in chanaged')
              console.log('entered into false state');
              document.querySelector('#panel').innerText = "Login";
            } else if (changes?.loggedIn && changes.loggedIn?.newValue === true) {
              console.log('entered into True state');
              document.querySelector('#panel').innerText = "Panel";
            }

          });

          let removeHiddenAdsInterval = undefined;
          /*document.getElementById("rocket").addEventListener("click", function (e) {
            
            if (e.target.classList.contains("inactive")) {
              e.target.setAttribute("src", rocketActive);
              e.target.classList.remove("inactive");
              e.target.classList.add("active");

              removeHiddenAdsInterval = setInterval(() => {
                document.querySelectorAll("div.xh8yej3").forEach((e) => {
                  if (e.style.display == "none") {
                    // console.log('display none reomve');
                    e.remove();
                  }
                });
                document.querySelectorAll(".oneuse").forEach((e) => {
                  // if (e.style.display == 'none') {
                  const adsn = Number(
                    document.querySelector("#adsnumber").value
                  );
                  if (adsn > 0) {
                    // console.log('ads > 0');
                    // console.log('e remove');
                    e.remove();
                  }

                  // };
                });
                document.querySelectorAll(".card-shadow").forEach((e) => {
                  if (e.style.display == "none") {
                    // console.log('display none card shadow removed');
                    const parentEl = e.parentElement;
                    const el = e;
                    el.remove();
                    parentEl.remove();
                  }
                });
                document.querySelectorAll(".hideIt").forEach(e => {
                  const adsn = Number(
                    document.querySelector("#adsnumber").value
                  );
                  if (adsn > 0) {
                    // console.log('ads > 0');
                    // console.log('e remove');
                    e.remove();
                  }

                })
              }, 500);
            } else {
              e.target.setAttribute("src", rocketInactive);
              e.target.classList.remove("active");
              e.target.classList.add("inactive");
              clearInterval(removeHiddenAdsInterval);
            }
              
            
          });*/

         
        

          //status
          document.getElementById("selectStatus").onclick = function (event) {
            event.stopPropagation(); // Ensure click event doesn't propagate
            hideActivePopup(); // Hide any active popup before showing the new one
            let popup = statusPopup();
            setTimeout(() => {
                popup.show();
                activePopup = popup; // Set the new active popup
            }, 10); // Slight delay to ensure popup is ready
          };      

          //Pais
          document.getElementById("selectCountry").onclick = function (event) {
            event.stopPropagation(); // Ensure click event doesn't propagate
            hideActivePopup(); // Hide any active popup before showing the new one
            let popup = countryPopup();
            setTimeout(() => {
                popup.show();
                activePopup = popup; // Set the new active popup
            }, 10); // Slight delay to ensure popup is ready
         }; 
          
          //language
          document.querySelector("#selectLanguage").onclick = function (event) {
            event.stopPropagation(); // Ensure click event doesn't propagate
            hideActivePopup(); // Hide any active popup before showing the new one
            let popup = languagePopup();
            setTimeout(() => {
                popup.show();
                activePopup = popup; // Set the new active popup
            }, 10); // Slight delay to ensure popup is ready
          };          

          /*document.querySelector(".mediaTypeBlock").onclick = function () {
            let popup = mediaTypePopup();
            popup.show();
          };*/

          // Popup para el tipo de creativo: Imagen, video, etc.
          document.querySelector(".mediaTypeBlock").onclick = function (event) {
            event.stopPropagation(); // Ensure click event doesn't propagate
            hideActivePopup(); // Hide any active popup before showing the new one
            let popup = mediaTypePopup();
            setTimeout(() => {
                popup.show();
                activePopup = popup; // Set the new active popup
            }, 10); // Slight delay to ensure popup is ready
        };


        // Por pagina de aterrizaje: Landing, Whatsapp, Facebook, Messenger, Instagram
        document.querySelector(".plateformBlock").onclick = function (event) {
          event.stopPropagation(); // Ensure click event doesn't propagate
          hideActivePopup(); // Hide any active popup before showing the new one
          let popup = plateformPopup();
          setTimeout(() => {
              popup.show();
              activePopup = popup; // Set the new active popup
          }, 10); // Slight delay to ensure popup is ready
        };
          


          document.getElementById("from_date").addEventListener("input", (e) => {
            from_date = e.target.value;

            if (new Date(from_date) > new Date()) {
              MessagePopup(
                "Elija amablemente la fecha actual o una fecha del pasado."
              );
            } else if (document.querySelector("#to_date")?.value) {
              const date1 = new Date(from_date);
              to_date = document.querySelector("#to_date")?.value;
              const date2 = new Date(to_date);

              if (date1 > date2 || date1 == date2) {
                MessagePopup(
                  "Desde la fecha debe ser menor que hasta la fecha. Gracias!"
                );
              } else {
                applyDateFilter();
              }
            }
          });
          document.getElementById("to_date").addEventListener("input", (e) => {
            to_date = e.target.value;

            if (new Date(to_date) > new Date()) {
              MessagePopup(
                "Elija amablemente la fecha actual o una fecha del pasado."
              );
            } else if (document.querySelector("#from_date")?.value) {
              from_date = document.querySelector("#from_date")?.value;
              const date1 = new Date(from_date);
              const date2 = new Date(to_date);

              if (date1 > date2 || date1 == date2) {
                MessagePopup(
                  "Desde la fecha debe ser menor que hasta la fecha. Gracias!"
                );
              } else {
                applyDateFilter();
              }
            }
          });

          const c = (e = !1) => {

            (H = 0), U && ((q = !0), clearInterval(M), fe(e));
          };
          function ge() {
            try {
              he(),
                y[b].see_more
                  ? $('a[href*="#"][role*="button"] > span').each(function () {
                    -1 !== $(this).parent("a").attr("href").indexOf("#") &&
                      ($(this).trigger("click"), e("see more clicked ###"));
                  })
                  : $("a > span:contains(" + y[b].see_more + ")").each(
                    function () {
                      -1 !== $(this).parent("a").attr("href").indexOf("#") &&
                        ($(this).trigger("click"), e("see more clicked ###"));
                    }
                  );
            } catch (e) {
              console.log("exception:4 " + e);
            }
          }
          (document.getElementById("hidebtn").onclick = function () {
            var e = document.getElementById("notebar");
            e.classList.add("hidden");
          }),
            // (document.getElementById("enableFilter").onclick = function () {
            //   h(!0),
            //     setTimeout(() => {
            //       if (((H = 0), document.getElementById("enableFilter").checked)) {
            //         (q = !0), (U = !0);
            //         let e = document.getElementById("adsnumber").value;

            //         (d = Number(e)), (o = !1);
            //       } else (q = !1), (o = !0);
            //       pe(), fe(), h(!1);
            //     }, 300);
            // }),
            (document.getElementById("enableScroll").onclick = function () {
              h(!0),
                setTimeout(function () {
                  document.getElementById("enableScroll").checked
                    ? (a && clearInterval(a),
                      (a = setInterval(function () {
                        window.scrollBy({ top: 300, behavior: "smooth" }), ge();
                      }, getRandomNumber(10000, 15000))))
                    : (clearInterval(a), h(!1));
                }, 0);
            }),
            (document.getElementById("all-months").onclick = function () {
              h(!0),
                (H = 0),
                setTimeout(function () {
                  (s = !!document.getElementById("all-months").checked),
                    fe(),
                    h(!1);
                }, 200);
            }),
            (document.getElementById("removehidden").onclick = function () {
              ie = !!document.getElementById("removehidden").checked;
            });
          const u = (e) => {
            C = !1;
            try {

              d = document.querySelector("#adsnumber").value;

              if (d == 0) {
                e.classList.remove("hideIt")
                e.style.display = 'block';
              }
              if (d == 1 && e.classList.contains("oneuse")) {

                e.classList.remove("hideIt")
                e.style.display = 'block';
                removeCardUIMain(e)
                removeCardUI(e)
              } else if (d > 1 && e.classList.contains("oneuse")) {

                e.classList.add("hideIt");
                // console.log('display none');
                e.style.display = 'none';
              }
              else if ($(e).find(r("//div[1]/div[1]")).text().includes(y[b].use_this)) {

                for (const t of e.querySelectorAll("span>strong"))
                  if (t.textContent.includes(y[b].ads)) {
                    //console.log("texto duplicados es===", y[b].ads)
                    t.classList.add("totalads");

                    //TODO: ocultar el texto solo si tiene activo los filtros
                    //t.parentElement.style.color = "transparent";
                    
                    let n = t.textContent,
                      a = n.replace(/[^0-9\u0660-\u0669]/g, "");
                    a = v(a);
                    let i = a.length;
                    if (i <= 0 || i > 3) {

                      return e.classList.add("oneuse"), ie && e.remove(), !1;
                    }

                    let o = Number(a);
                    if (o >= z) {
                      C = !0;
                    }

                    let dateString = e?.querySelectorAll(
                      '[class*="x8t9es0 xw23nyj xo1l8bm x63nzvj x108nfp6 xq9mrsl x1h4wwuj xeuugli"]'
                    )[1]?.innerText;

                    //TODO: CORREGIR dateString
                    //console.log("dateString is: ====", dateString)

                    let adActiveDays = undefined;
                    let startDate = undefined;
                    if (dateString.includes("-")) {
                      startDate = dateString.split("-")[0];
                      startDate = replaceMonth(startDate);
                      let endDate = dateString.split("-")[1];
                      endDate = replaceMonth(endDate);
                      endDate = new Date(endDate);
                      adActiveDays = getDaysDifference(startDate, endDate);
                    } else if (dateString.includes("desde")) {


                      startDate = extractDate(dateString)

                      //console.log("LA FECHA EXTRAIDA ES:", startDate)

                      const currentDate = new Date();
                      //console.log("LA FECHA actual ES:", currentDate)
                      adActiveDays = getDaysDifference(
                        startDate,
                        currentDate
                      );
                    }else if (dateString.includes("Started")) {


                      startDate = extractDateEn(dateString)

                     // console.log("LA FECHA EXTRAIDA ES:", startDate)

                      const currentDate = new Date();
                      adActiveDays = getDaysDifference(
                        startDate,
                        currentDate
                      );
                    }else if (dateString.includes("iniciada em")) {


                      startDate = extractDate(dateString)

                     // console.log("LA FECHA EXTRAIDA ES:", startDate)

                      const currentDate = new Date();
                      adActiveDays = getDaysDifference(
                        startDate,
                        currentDate
                      );
                    } else {
                      let result = dateString.split(/(?=\d)/);
                      result.shift();
                      startDate = result?.join("");
                      const currentDate = new Date();
                      adActiveDays = getDaysDifference(
                        startDate,
                        currentDate
                      );
                    }

                    adActiveDays = Number(adActiveDays);


                    duplicatesAds = o;
                    userEnteredAds = d;

                    if (d != 0 && o >= d) {
                      // console.log("now Im displaying block having duplicates:" + o + "and digits:" + d);
                      e.classList.remove("hideIt");
                      e.style.display = "block";
                      t.style.fontSize = "150%";
                      t.textContent = a + " " + y[b].ads;

                      let firstColor = "rgb(111, 88, 244)";
                      let secondColor = "rgb(255, 99, 71)";
                      let thirdColor = "red";
                      let fourthColor = "#10E6FE";
                      let activeDaysColor = undefined;

                      //set color of active days
                      if (adActiveDays <= 14) {
                        activeDaysColor = firstColor;
                      } else if (adActiveDays <= 21) {
                        activeDaysColor = secondColor;
                      } else if (adActiveDays <= 28) {
                        activeDaysColor = thirdColor;
                      } else if (adActiveDays >= 35) {
                        activeDaysColor = fourthColor;
                      }

                      // set emoji
                      let emoji = "";
                      let duplicates = o;
                      // console.log('Duplicates:' + o);
                      // console.log('Duplicates:' + duplicates);
                      if (adActiveDays >= 28 && duplicates <= 16) {
                        // if (adActiveDays >= 1 && duplicates <= 16) {
                        emoji = "🔥";
                      }
                      if (
                        adActiveDays >= 21 &&
                        duplicates >= 25 &&
                        duplicates <= 49
                      ) {
                        emoji = "🚀";
                      }
                      if (adActiveDays >= 28 && duplicates >= 50) {
                        emoji = "💵";
                      }

                      const adsElement = t.parentElement.parentElement;
                      if (!adsElement.querySelector(".activeDays")) {
                        // console.log('!adsElement.querySelector(".activeDays")');
                        // console.log("not active days");
                        adsElement.setAttribute("style", "display:block;");
                        //obtiene el texto: "n anuncios usan este contenido y texto
                        const activeDaysElement = document.createElement("span");
                        const brTag = document.createElement("br");
                        activeDaysElement.classList = "x8t9es0 x1fvot60 xo1l8bm xxio538 x108nfp6 xq9mrsl x1h4wwuj xeuugli activeDays";
                        activeDaysElement.innerHTML = `<strong class="totalDays" style="font-size: 150%; color:${activeDaysColor};">${adActiveDays} ${y[b].active} ${emoji}</strong>`;
                        if (!adsElement.querySelector('br'))
                          adsElement.appendChild(brTag);
                        adsElement.appendChild(activeDaysElement);
                      } else {
                        // console.log('active days present ');
                        // console.log(e);
                      }

                      //set color of ads
                      if (o >= 1 && o <= 15) {
                        t.style.color = firstColor;
                        t.textContent += emoji;
                      } else if (o > 35) {
                        t.style.color = fourthColor;
                        t.textContent += emoji;
                      } else if (o > 25) {
                        t.style.color = thirdColor;
                        t.textContent += emoji;
                      } else if (o > 15) {
                        t.style.color = secondColor;
                        t.textContent += emoji;
                      }

                      C = !0;
                    } else if (o < d) {
                      // if (d != 0) {
                      // console.log("display none having less duplicates the d duplicate: " + o);
                      // console.log(e);
                      e.classList.add("hideIt");
                      // console.log('display none');
                      e.setAttribute("style", "display:none !important");
                      // }
                    }

                    // console.log("Return C");
                    // console.log(C);
                    return C;
                  }
                return !1;
              }
              return e.classList.add("oneuse"), !1;
            } catch (e) {
              return (
                // console.error(e),
                console.log("exception:2 Condition exception " + e.message),
                !1
              );
            }
          },
            p = () => {
              if (-1 !== location.href.indexOf("page_id=")) {
                e("we are on the page hollaaa ############### "),
                  (l = !0),
                  (R = 1);
              } else l = !1;
            };
          function he() {
            if (U) {
              // console.log('he called');
              var e = null !== document.querySelector(Q);
              if (e) {

              } else
                console.log(
                  "Warning: Extract " + Q + " NOT FOUND Months Sections !!!!!!!"
                );
            }
          }


          async function fe(t = !1) {
            if (U) {
              
              let a;
              t || (he(), _e());
              let i = Y;
              
              try {
                try {
                  a = $(i);
                  
                } catch (e) {
                  console.log("la excepcion es:", e)  
                  console.log("Exception trimAds1: " + Y + " Ad Card");
                }
                var n = a.length;
                
                if (n > H || 0 == H) {
                  
                  s && (H = 0);
                  for (let e = 0; e < n; e++)
                    
                    setTimeout(() => {
                       
                       
                      ke(a[e], t);
                    }, 0);
                } else e("info : PASS... Nothing in Feed ");
              } catch (t) {
                e("#### ERROR ##### " + t.message);
              }
            } else {
              console.log("OJO ERROR EN Fe porque", U)
            }
          }
          function pe() {
            if (!q || !U) return clearInterval(M), !1;
            D = null;
            var t = !1;
            M && clearInterval(M),
              (M = setInterval(() => {
                if (D && t)
                  clearInterval(M), e("info: rootEL true ###"), U && _e();
                else {
                  e("info: rootEL false ###");
                  try {
                    const n = document.querySelector(K).parentElement,
                      a = n.parentElement;
                    n && (t = !0), a && (page = "ads"), (D = a);
                  } catch (t) {
                    e("exception:3 " + K + " _ " + t.message);
                  }
                }
              }, 50));
          }
          function ve() {
            chrome.runtime.sendMessage({ greeting: "hello" }, function (e) {
              e && 0 !== e.farewell
                ? chrome.storage.local.set({ jwt: e.farewell }, function () {
                  (O = e.farewell), O ? i(be) : be(!1);
                })
                : (console.log("ClicSpy: not logged in ..."), be(!1));
            });
          }
          function ye(t, n) {
            // Get the keys of object 't'
            let keys = Object.keys(t);

            // Check if 'jwt' key exists in the object keys
            if (keys.includes("jwt")) {
              // If 'jwt' exists
              log(
                "=onchanged logStorageChange. Change in JWT storage area: " + n
              );
              let newValueJWT = t.jwt.newValue;
              if (newValueJWT) {
                be(true);
              } else {
                be(false);
              }
            } else if (keys.includes("status")) {
              // If 'status' exists
              let newValueStatus = t.status.newValue;
              if (newValueStatus === true) {
                // If status is true
                enableExtension();
              } else if (newValueStatus === false) {
                // If status is false
                disableExtension();
              }
              fe();
            }

            // Function to enable extension
            async function enableExtension() {
              H = 0;
              console.log("####### Status Changed #######");
              await new Promise((rs, rj) => setTimeout(rs, 3000));
              showToolBar(true);
            }

            // Function to disable extension
            async function disableExtension() {
              H = 0;

              await new Promise((rs, rj) => setTimeout(rs, 3000));

              showToolBar(false);
            }
          }

          function be(e) {
            e
              ? ((L = I), $("#dashboard").html("Dashboard"), f(!0))
              : ((L = w), $("#dashboard").html("login"), f(!1));
          }
          function xe(e) {
            chrome.storage.local.get("jwt", e);
          }
          function _e() {
            se = true;
            if (!x) {
              x = true;
              if (q && U) {
                // console.log(K);
                $.initialize(K + ":not(.card-ad)", function () {
                  // console.log(this);
                  // console.log($(this).parent().get(0));
                   //console.log("OJO ke called _e funciton");
                  ke($(this).parent().get(0));
                  H++;
                });
              }
            }
            // console.log('Se is set false');
            se = false;
          }

          async function ke(n, a = !1) {
            

            try { 

              
              if (extension_status == "active") {
                

                // console.log('status active then show n div');
                var mydiv;

                const adsNum = parseInt(document.getElementById("adsnumber").value) ;
                

                


                var i = u(n);

                // console.log(i);

                // if(adsNum>0)
                // console.log(d);
                if (d > 1 && n.classList.contains("oneuse")) {
                  // console.log('d > 1 && e.classList.contains("onuse")');
                  n.classList.add("hideIt");
                  // console.log('display none');
                  n.style.display = 'none';
                }
                 
                // console.log('Ads Number: ' + adsNum);
                if (adsNum >= 1) {
                  // let ad_value = n.querySelectorAll(
                  //   '[class*="x8t9es0 xw23nyj xo1l8bm x63nzvj x108nfp6 xq9mrsl x1h4wwuj xeuugli"]'
                  // )[1]?.innerText;
                  // let ad_value = ad_status;
                  // console.log('crate header');
                  const adHeaderDiv = document.createElement("div");
                  adHeaderDiv.id = "adHeader";

                  const Guardar_Anuncio_Ganador_Btn =
                    document.createElement("button");
                  Guardar_Anuncio_Ganador_Btn.id =
                    "Guardar_Anuncio_Ganador_Btn";
                  Guardar_Anuncio_Ganador_Btn.setAttribute("style", "");
                  Guardar_Anuncio_Ganador_Btn.innerText = "Guardar anuncio";
                  Guardar_Anuncio_Ganador_Btn.addEventListener("click", async (e) => {

                    const { selectedCatg } = await chrome.storage.local.get("selectedCatg");
                    const { loggedIn } = await chrome.storage.sync.get("loggedIn")
                    if (loggedIn) {
                      if (selectedCatg || false) {
                        selectedMainCategory = selectedCatg;
                        const data = getAdData(n, selectedCatg);
                        // console.log(data);
                        /* --- 1. Mostrar barra de progreso --- */
                        showSavingBar(n);
                        sendPostRequest(data, n);
                        // showPopup()
                        // Pop up the div
                        div.style.display = "flex";
                      } else {
                        // console.log(
                        //   "No category selected",
                        //   e.target.parentElement
                        // );
                        let popup = adCategoryPopup(e.target);
                        popup.show();
                      }
                    } else {
                      // showPopup()
                      logInMessage("Por favor haz clic el ícono de la extensión que se encuentra en esta misma pestaña, en la esquina superior derecha para iniciar sesión y poder guardar anuncios")
                    }

                  }
                  );

                  const categoryIconDiv = document.createElement("div");
                  categoryIconDiv.id = "adCategoryPopup";
                  const categoryPopupBtn = document.createElement("img");
                  categoryPopupBtn.setAttribute(
                    "src",
                    chrome.runtime.getURL("./images/pluspop.svg")
                  );
                  categoryPopupBtn.setAttribute(
                    "style",
                    "width:15px; height:15px;cursor:pointer;"
                  );
                  categoryPopupBtn.id = "";
                  
                  /*categoryPopupBtn.addEventListener("click", (e) => {
                    let popup = adCategoryPopup(e.target);
                    popup.show();
                  });*/

                  // NEW NATIVE POPUP LOGIC for categoryPopupBtn:
                  categoryPopupBtn.addEventListener("click", async (e) => {
                    e.stopPropagation(); // Prevent event bubbling

                    // Ensure any old Tippy popups are hidden if necessary (good practice)
                    hideActivePopup(); // Your existing function to hide Tippy popups

                    // ----> SET THE CURRENT AD CARD CONTEXT HERE <----
                    currentAdCardForNativePopup = n; // Assign the current ad card 'n'

                    const optionsBox = document.getElementById('nativeCategoryOptionsBox');
                    if (!optionsBox) {
                      console.error("Native category optionsBox not found!");
                      return;
                    }

                    showNativeCategoryPopup(); // Show the new native popup

                    try {
                      // Call loadCategories
                      await loadCategories({
                        container: optionsBox,
                        onSelect: nativeUpdateName, // Use the new onSelect handler
                        beforeRender() {
                          optionsBox.querySelectorAll(".category_name").forEach(el => el.remove());
                        }
                      });
                    } catch (error) {
                      console.error("Error loading categories into native popup:", error);
                      MessagePopup("Error al cargar categorías."); // Your existing MessagePopup
                      hideNativeCategoryPopup(); // Hide if loading fails
                    }
                  });

                  categoryIconDiv.appendChild(categoryPopupBtn);
                  adHeaderDiv.appendChild(Guardar_Anuncio_Ganador_Btn);
                  // adHeaderDiv.appendChild(categoryPopupBtn);
                  adHeaderDiv.appendChild(categoryIconDiv);

                  const downloadIcon = document.createElement("img");

                  downloadIcon.src = chrome.runtime.getURL(
                    "./images/download-minimalistic-svgrepo-com.svg"
                  );
                  downloadIcon.id = "download_btn";
                  downloadIcon.setAttribute(
                    "style",
                    "cursor:pointer; width:20px; height:20px;"
                  );
                  downloadIcon.addEventListener("click", () => {
                    let links = [];
                    let category = null;

                    if (n.querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')?.querySelectorAll("img")[0]) {
                      n.querySelector(
                        '[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]'
                      )
                        ?.querySelectorAll("img")
                        .forEach((element) => {
                          links.push(element.src);
                          category = "image";
                        });
                    } else if (
                      n
                        .querySelector(
                          '[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]'
                        )
                        ?.querySelectorAll("video")[0]
                    ) {
                      n.querySelector(
                        '[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]'
                      )
                        ?.querySelectorAll("video")
                        .forEach((element) => {
                          links.push(element.src);
                          category = "video";
                        });
                      showDownload("flex");
                    }
                    chrome.runtime.sendMessage({
                      msg: "download",
                      category: category,
                      url: links,
                    });
                  });

                  // Check if neither #download_btn nor #Guardar_Anuncio_Ganador_Btn exists
                  if (!n.querySelector("#download_btn") && !n.querySelector("#Guardar_Anuncio_Ganador_Btn")) {
                    removeCardUI(n);
                    
                    
                    
                                       
                    
                    if (adsNum >= 1 ) {

                     


                      // console.log('PRespend header');
                      n.classList.remove("hiden");
                      if (n !== undefined) {
                        n.style.display = "block";
                        $(n).children("div:first").addClass("card-shadow");
                        $(n).children("div:first").prepend(adHeaderDiv);
                        n.querySelector('[class="x2lah0s x9otpla x14z9mp x1wsgfga xdwrcjd"]').prepend(downloadIcon);


                        //get the href of the ad
                        //the hyperlink of the image or video
                        var ahref =
                          n.querySelector('[class*="x1yc453h x1h4wwuj x1fcty0u x1lliihq"]') ||
                          "N/A";

                        //limpiar la url del sitio web a la que se dirige el anuncio
                        if (ahref !== "N/A") {
                          const decodedUrl = decodeURIComponent(ahref);

                          // Remove the specified prefix
                          ahref = decodedUrl.replace("https://l.facebook.com/l.php?u=", "");

                          const startIndex = 0; // starting index (inclusive)

                          //remover query string
                          var endSize = ahref.indexOf("&h=AT");

                          ahref = ahref.substring(startIndex, endSize);
                        } else {
                          //si no tiene cta
                          ahref = ""
                        }

                        //get the button section: "Ver mas detalles"
                        let divElement = n.querySelector('[class="x193iq5w xxymvpz x78zum5 x1iyjqo2 xs83m0k x1d52u69 xktsk01 x1yztbdb"]');
                        
                        // Define the new content
                        let newContent = `
                         <a href='${ahref}' target='_blank'>
                           <button class="vpbutton">Ver la página <img src='${chrome.runtime.getURL("./images/open_in_new_tab.png")}'></button>
                          </a>
                          `;
                          
                          // Get the HTML as a string
                          let htmlString = divElement.innerHTML;

                          // Define the start and end sections
                          let startSection = '<div aria-busy="false"';
                          let endSection = '</span></div>';

                         

                          let startIndex = htmlString.indexOf(startSection);
                          let endIndex = htmlString.indexOf(endSection);

                          

                          if (startIndex !== -1 && endIndex !== -1) {
                            divElement.innerHTML = htmlString.slice(0, startIndex) + newContent + htmlString.slice(endIndex + endSection.length);
                          }



                      } else {
                        e("Error adToggleStyle:1 undefined ad !!! .."); // Log error message
                      }
                    } else {
                      console.log("ENTRO POR UNOS")
                      e("condition false......");
                      if (!o || d <= 1) {
                        // console.log('display blocked');
                        //n.style.display = "block"; // Display n
                      } else {
                        // console.log('display none');
                        n.style.display = "none"; // Hide n
                        if (ie) { // If ie is true
                          // console.log('remove from dom');
                          n.remove(); // Remove n from the DOM
                        }
                      }
                    }
                    if (!a) {
                      de(n);
                      if (C && !ae) {
                        A = null;
                        T = m(n);
                        if (T) {
                          j.push(T);
                          await t(T, k, re, n);
                        }
                      }
                    }
                  }

                } else {
                  removeCardUIMain(n);
                }


                // console.log(CTA);
                if (CTA)
                  updateCtaNewAd(CTA, n)

                // updateCtaNewAd(cta, n)

                const extDiv = document.querySelector("#extension_status");
                const willRemove =
                  !extDiv || extDiv.dataset.willRemove === "true";
                if (adsNum == 0 && !willRemove) {
                  if (
                    n &&
                    !n?.querySelector("#adHeader") &&
                    !n?.querySelector("#adHeader2")
                  ) {
                    injectCardUI(n);
                  } else {
                    console.log("NO INYECTA")
                  }
                } else{
                  console.log("NO INYECTA PORQUE ADS NUM O WILL REMOVE NO FUNCIONAN")
                }

                if (willRemove) {
                  removeCardUI(n);
                }
              }
            } catch (t) {
              e("!!!!!!!!!!!!! Excpetion  ..." + t.message + "!!!!!!!!!!");
            }
          }
          // chrome.storage.onChanged.addListener(ye);

          const _ = () => {
            setInterval(
              (function t() {
                return e("Test Now ...."), ve(), t;
              })(),
              54e4
            ),
              // n(),
              p(),
              e("# Started #"),
              pe(),
              ce(pe, p);
          };
          _(),
            (document.getElementById("panel").onclick = async function () {
              const { loggedIn } = await chrome.storage.sync.get("loggedIn")
              if (loggedIn) {
                chrome.runtime.sendMessage({ type: "getToken" }, (res) => {
                  if (res?.token) {
                    window.open(
                      `https://app.pulpoia.com/?token=${res?.token}`,
                      "_blank"
                    );
                    /*window.open(
                      `http://localhost:3000/?token=${res?.token}`,
                      "_blank"
                    );*/                    
                  } else {
                    // alert("Por favor, inicia sesión para abrir el Panel")
                    showSignInMessagePopup();
                  }
                });
              } else {
                logInMessage("Por favor haz clic el ícono de la extensión que se encuentra en esta misma pestaña, en la esquina superior derecha para iniciar sesión y poder guardar anuncios")
              }


            });

          let E = document.querySelector("#adsnumber");
          function Ee(e) {
            let t = e.target;
            "range" !== e.target.type && (t = document.getElementById("range"));
            const n = t.min,
              a = t.max,
              i = t.value;
            t.style.backgroundSize = (100 * (i - n)) / (a - n) + "% 100%";
            let o = document.getElementById("adsnumber").value;
            chrome.storage.local.set({ adsNumber: o });
            d = Number(o);
          }
          let S = !1;
          try {
            E.addEventListener("input", function (e) {
              h(!0),
                (S = !0),
                setTimeout(() => {
                  Ee(e);
                }, 50);
            }),
              E.addEventListener("mouseup", function (e) {
                (S = !1),
                  setTimeout(() => {
                    setTimeout(() => {
                      // console.log('MouseUP is called');
                      S || (Ee(e), c(!0)), h(!1);

                    }, 200);
                  }, 70);
              });
          } catch (e) {
            console.log("Handle inpute " + e.message);
          }
        }
      } catch (e) {
        console.log(e);
      }
    }

    // Set AdsNumber

    chrome.runtime.onMessage.addListener(async function (
      request,
      sender,
      sendResponse
    ) {
      if (request.message == "baseUrl") {
        const base64String = request.base64url;
        if (request.category == "video") {
          const mimeType = "video/mp4"; // The MIME type of your data here
          const blob = base64ToBlob(base64String, mimeType);
          saveAs(blob, "video.mp4");
          document.querySelector("#showDownload").remove();
        } else if (request.category == "image") {
          const mimeType = "image/png"; // The MIME type of your data here
          const blob = base64ToBlob(base64String, mimeType);
          saveAs(blob, `image ${request.imgNo}.png`);
        }
      } else {
        document.querySelector("#showDownload").remove();
        alert("There is issue in downloading this video/image");
      }
    });

    function base64ToBlob(base64String, mimeType) {
      const byteCharacters = atob(base64String);
      const byteArrays = [];

      for (let i = 0; i < byteCharacters.length; i++) {
        byteArrays.push(byteCharacters.charCodeAt(i));
      }

      const byteArray = new Uint8Array(byteArrays);
      return new Blob([byteArray], { type: mimeType });
    }
  })();

  async function sendPostRequest(data, n) {
    console.log(data);
    chrome.runtime.sendMessage({ msg: "sendData", data: data }, (res) => {
      const changeCardColor = () => {
        const postDataBtn =
          n.querySelector("#Guardar_Anuncio_Ganador_Btn") ||
          n.querySelector("#Guardar_Anuncio_Ganador_Btn2");
        const adSign =
          n.querySelector("#adCategoryPopup") ||
          n.querySelector("#adCategoryPopup2");
        adSign.querySelector("img").style.visibility = "hidden";
        adSign.style.backgroundColor = "#1dbf73";
        postDataBtn.style.backgroundColor = "#1dbf73";
        postDataBtn.style.border = "2px solid #1dbf73";
        postDataBtn.innerText = "Anuncio guardado";
        postDataBtn.parentElement.parentElement.classList.add("saved");
      };

      //already saved
      if (res.error && res.message?.includes("has guardado anteriormente:")) {
        changeCardColor();
        //showPopup("Este anuncio ya ha sido guardado anteriormente", true);
        //showPopup("Próximamente podrás guardar tus favoritos", false)
      }
      //some other error occured: EXCEDIÓ LA CAPACIDAD DE CATEGORIAS O DE ANUNCIOS GUARDADOS
      else if (res.error) {
        showPopup(res.message, true)
      }
      //post is saved
      else {
        // showPopup(res.message, false);
        //change card color
        changeCardColor();
        hideSavingBar(n); 
      }
    });
  }

  // Example usage:
  // <div id="selectedStatus">Activos e inactivos</div>

  const LanguageHTML = `
  <div id="LanguageDiv">
  <div id="LanguageList">
      <div class='language-item'>
        <input type="checkbox" id="language1" name="language1" value="es">
        <label for="Español">Español</label><br>
      </div>
      
      <div class='language-item'>
        <input type="checkbox" id="language2" name="language2" value="pt">
        <label for="Portugues">Portugues</label><br>
      </div>
      
      <div class='language-item'>
        <input type="checkbox" id="language3" name="language3" value="en">
        <label for="Ingles">Ingles</label><br>
      </div>
     
      <div class='language-item'>
        <input type="checkbox" id="language4" name="language4" value="it">
        <label for="Itanliano">Italiano</label><br>
      </div>

      <div class='language-item'>
        <input type="checkbox" name="languge5" id="language5" value="ru">
        <label for="Ruso">Ruso</label>
      </div>

  </div>
  <div class="select-laguage-button">
      <button>Aplicar filtro</button>
  </div>
</div>
  `

  const mediaTypeHTML = `
  <div id="mediaTypeDiv">
    <ul id="mediaTypeList">
    </ul>
</div>
  `
  const plateformHTML = `
<div id="plateformDiv">
    <ul id="plateformList">
    </ul>
</div>
`;

  const stautsHTML = `
<div id="statusDiv">
<div id="selectedStatus" style="display:none">Activos e inactivos</div>
    <ul id="statusList">
        <li><input type="radio" name="status" value="all"><label for="Activos e inactivos">Activos e
                inactivos</label>
        </li>
        <li><input type="radio" name="status" value="active"><label for="activos">Activos</label>
        </li>
        <li><input type="radio" name="status" value="inactive"><label for="Inactivos">
                Inactivos</label></li>
    </ul>
</div>
`;

  const countryHTML = `

<div class="select-box">
        <div class="options active">
            <input type="text" class="search-box" style="color:black" placeholder="Ingrese el nombre del país para buscar">
          
            <ol>

            </ol>
        </div>
    </div>
`;

  const categoryHTML = `
<div id="category_popup">



    <section id="dropdown">
      <header class="heading" id='categoryHeader' style="color:black;"></header>
      <div class="select-wrapper">
        <div class="select-btn">
          <span id="selectedCategory" >Crear o Escoger Categoría</span>
          <i>
            <img class="dropdown-image" active src="${chrome.runtime.getURL(
    "./images/downicon.svg"
  )}" width="10px" height="10px" alt="">
            <img class="add-image" style="margin-left: 5px;" active src="${chrome.runtime.getURL(
    "./images/plus.svg"
  )}" width="10px" height="10px" alt="">
          </i>
        </div>
        <div class="content">
          <div class="search">
            <ion-icon name="search" ></ion-icon>
            <input type="text" class='searchText'>
            <div id="popup_message"></div>
          </div>
          <ul class="options"></ul>
        </div>
      </div>
     
      <div id="button_div">
        <button class="selectBtn" id='automation' style=''>Guardar</button>
      </div>

    </section>

</div>
`;


function languagePopup() {
  console.log("I AM POPUP BEFORE TIPPY");
  
    // Destroy any existing tippy instance on the element before creating a new one
    const existingTippy = document.querySelector(".languageBlock")._tippy;
    if (existingTippy) {
      existingTippy.destroy();
    }

  const popup = tippy(document.querySelector(".languageBlock"), {
    allowHTML: true,
    trigger: "manual",
    content: LanguageHTML,
    sticky: true,
    interactive: true,
    arrow: false,
    placement: "top",
    appendTo: LIBRARY_FILTER, // Append to the library filter element
    onShow: function () {
      setTimeout(() => {
        console.log("I AM POPUP ONSHOW IN TIPPY, WE ARE INSIDE");

        const selectedLanguages = [];
        const searchParams = new URLSearchParams(window.location.href);
        const contentLanguages = [];

        searchParams.forEach((value, key) => {
          if (key.startsWith("content_languages")) {
            contentLanguages.push(value);
          }
        });

        console.log(contentLanguages);
        const languageCheckboxes = document.querySelector("#LanguageList").querySelectorAll('input[type="checkbox"]');
        languageCheckboxes.forEach((element) => {
          if (contentLanguages.includes(element.value)) {
            element.checked = true;
          }
        });

        document.querySelector("#LanguageList").querySelectorAll('.language-item').forEach(e => {
          e.addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent propagation within the popup
            const checkbox = e.target.querySelector('input[type="checkbox"]');
            if (checkbox) {
              checkbox.checked = true;
            } else if (e.target.getAttribute('type') !== 'checkbox') {
              const parentCheckbox = e.target.parentElement.querySelector('input[type="checkbox"]');
              if (parentCheckbox) {
                parentCheckbox.checked = true;
              }
            }
          });
        });

          document.querySelector('.select-laguage-button button').addEventListener("click", function (e) {
            e.stopPropagation(); // Ensure click event doesn't propagate
          document.querySelector("#LanguageList").querySelectorAll('input[type="checkbox"]').forEach(e => {
            if (e.checked) {
              selectedLanguages.push(e.value);
            }
          });

          const urlObj = new URL(removePreviousLanguages());
          selectedLanguages.forEach((lang, index) => {
            urlObj.searchParams.set(`content_languages[${index}]`, lang);
          });

          console.log(urlObj);
          window.location.href = urlObj;
        });

        const tippyElement = document.querySelector("[id*=tippy]");
        const libraryFilterElement = document.querySelector("#library-filter");
        
        /*if (tippyElement && libraryFilterElement) {
          libraryFilterElement.insertBefore(tippyElement, libraryFilterElement.firstChild);
        } else {
          console.error("One or both of the elements not found.");
        }*/

      }, 0); // Ensure everything is rendered before proceeding
      },
      onHide: function() {
        // Clean up listeners or states if necessary after the popup is hidden
        console.log("Popup hidden, cleanup if necessary");
        activePopup = null; // Reset active popup when hidden
    }
  });
  return popup;
}
  


  function removePreviousLanguages() {

    const originalUrl = window.location.href;

    const url = new URL(originalUrl);

    const searchParams = url.searchParams;

    const keysToRemove = [];
    searchParams.forEach((value, key) => {
      if (key.startsWith("content_languages")) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach(key => {
      searchParams.delete(key);
    });

    const modifiedUrl = url.origin + url.pathname + "?" + searchParams.toString();

    // console.log(modifiedUrl);
    return modifiedUrl;

  }

  function mediaTypePopup() {
    // Destroy any existing tippy instance on the element before creating a new one
    const existingTippy = document.querySelector(".mediaTypeBlock")._tippy;
    if (existingTippy) {
        existingTippy.destroy();
    }

    const popup = tippy(document.querySelector(".mediaTypeBlock"), {
      allowHTML: true,
      trigger: "manual",
      content: mediaTypeHTML,
      sticky: true,
      interactive: true,
      arrow: false,
      placement: "top",
      appendTo: LIBRARY_FILTER,
        onShow: function () {  // Replaced onShown with onShow
            setTimeout(() => {
        const mediaTypes = [
          "Todos los Contenidos",
          "Imagen",
          "Memes",
          "Video",
          "Sin Imagen y Video"
                ];

        mediaTypes.forEach((media) => {
          const li = document.createElement("li");
          li.innerText = media;
          li.addEventListener('click', (e) => {
                        e.stopPropagation(); // Ensure click event doesn't propagate
                        const updatedURL = updateMediaType(window.location.href, e.target.innerText);
            window.location.href = updatedURL;
          });
          document.querySelector("#mediaTypeList").appendChild(li);
                });

        var tippyElement = document.querySelector("[id*=tippy]");
        var libraryFilterElement = document.querySelector("#library-filter");
        
        /*if (tippyElement && libraryFilterElement) {
          libraryFilterElement.insertBefore(tippyElement, libraryFilterElement.firstChild);
        } else {
          console.error("One or both of the elements not found.");
        }*/

            }, 0); // Slight delay to ensure everything is rendered before proceeding
        },
        onHide: function() {
            console.log("Popup hidden, cleanup if necessary");
            activePopup = null; // Reset active popup when hidden
      }
    });
    return popup;
  }



  function replaceMedia() {
    console.log('Replace media');

    //  "Todos los Contenidos",
    //  "Imagen",
    //  "Memes",
    //  "Video",

    const mediaType = new URLSearchParams(window.location.href).get("media_type");
    if (mediaType == 'all') {
      return "Todos los Contenidos"
    }
    else if (mediaType == 'image') {
      return "Imagen"
    } else if (mediaType == 'video') {
      return "Video"
    } else if (mediaType == 'meme') {
      return "Memes"
    } else if (mediaType == 'none') {
      return "Sin Imagen y Video"
    }


  }

  function plateformPopup() {
    // Destroy any existing tippy instance on the element before creating a new one
    const existingTippy = document.querySelector(".plateformBlock")._tippy;
    if (existingTippy) {
        existingTippy.destroy();
    }

    const popup = tippy(document.querySelector(".plateformBlock"), {
        allowHTML: true,
        trigger: "manual",
        content: plateformHTML,
        sticky: true,
        interactive: true,
        arrow: false,
        placement: "top",
        appendTo: LIBRARY_FILTER,
        onShow: function () {  // Replaced onShown with onShow
            setTimeout(() => {
                const plateforms = [
                    "Todas las URL",
                    "Páginas De Aterrizaje",
                    "Facebook",
                    "Messenger",
                    "Instagram",
                    "Whatsapp",
                ];

                plateforms.forEach((plateform) => {
                    const li = document.createElement("li");
                    li.innerText = plateform;
                    li.addEventListener('click', (e) => {
                        e.stopPropagation(); // Ensure click event doesn't propagate
                        const updatedURL = updatePlateform(window.location.href, e.target.innerText);
                        // window.location.href = updatedURL; // Uncomment if you want to navigate
                        document.querySelector('.tippy-box').parentElement.remove(); // Close the popup
                    });
                    document.querySelector("#plateformList").appendChild(li);
                });

                var tippyElement = document.querySelector("[id*=tippy]");
                var libraryFilterElement = document.querySelector("#library-filter");
                
                /*if (tippyElement && libraryFilterElement) {
                    libraryFilterElement.insertBefore(tippyElement, libraryFilterElement.firstChild);
                } else {
                    console.error("One or both of the elements not found.");
                }*/

            }, 0); // Slight delay to ensure everything is rendered before proceeding
        },
        onHide: function() {
            console.log("Popup hidden, cleanup if necessary");
            activePopup = null; // Reset active popup when hidden
        }
    });
    return popup;
  }


  //
  function adCategoryPopup(n) { // n is the trigger element
    // **Crucial Defensive Destruction (already present and correct):**
    if (n && n._tippy) {
        n._tippy.destroy();
    }

    const popup = tippy(n, {
      allowHTML: true,
      trigger: "manual",
      content: categoryHTML, // Ensure categoryHTML is defined
      sticky: true,
      theme: "light",
      interactive: true,
      arrow: false,
      placement: "right-start",
      appendTo: () => LIBRARY_FILTER(), // Ensure LIBRARY_FILTER is defined
      // --- Diagnostic Lifecycle Event Handlers ---
      onCreate: function(instance) {
        console.log("adCategoryPopup Tippy LIFECYCLE: onCreate - Instance created for element:", instance.reference);
      },
      onMount: function(instance) {
        console.log("adCategoryPopup Tippy LIFECYCLE: onMount - Popper element mounted for element:", instance.reference);
      },
      onShown: function(instance) {
        console.log("adCategoryPopup Tippy LIFECYCLE: onShow - Before popup is shown for element:", instance.reference);
        // If onShown does not fire, you could try moving the core logic here,
        // but be aware that the popup is not yet fully visible or animated.
        // For now, we'll keep the main logic in onShown and use this for logging.
      },
      onShow: function () { // Note: removed async here, as setTimeout handles the async nature
        
        const tippyInstance = this; // 'this' is the Tippy instance

        setTimeout(async () => { // Wrap entire onShown logic
            console.log("IS THERE ANY ACTIVITY HERE???")
            // Use tippyInstance.popper.querySelector for elements inside the popup
            let popupCategoryValue = null;
            const categoryHeader = tippyInstance.popper.querySelector("#categoryHeader");
            if (categoryHeader) categoryHeader.innerText = "Guardado";
            
            const selectWrapper = tippyInstance.popper.querySelector(".select-wrapper");
            const selectBtn = tippyInstance.popper.querySelector(".select-btn");
            const searchInput = tippyInstance.popper.querySelector(".searchText");
            const optionsBox = tippyInstance.popper.querySelector(".options");
            const downbtn = tippyInstance.popper.querySelector(".dropdown-image");
            const selectCateg = tippyInstance.popper.querySelector("#automation"); // "Seleccionar y guardar" button

            if (selectWrapper && selectBtn && searchInput && optionsBox && downbtn && selectCateg) {
                selectCateg.innerText = "Seleccionar y guardar";
                const buttonDiv = tippyInstance.popper.querySelector("#button_div");
                if (buttonDiv) buttonDiv.setAttribute("style", "padding-left:90px !important");
                
                selectCateg.addEventListener("click", async () => {
                    // **Robust ad card identification:**
                    const adCardElement = tippyInstance.reference.closest(Y); // Y is your ad card selector

                    if (!popupCategoryValue) {
                        MessagePopup("Por favor seleccione una categoría");
                    } else if (popupCategoryValue) {
                        if (!adCardElement) {
                            console.error("adCategoryPopup: Could not find parent ad card (Y selector) from trigger:", tippyInstance.reference);
                            MessagePopup("Error: Tarjeta del anuncio no encontrada.");
                            return;
                        }
                        const { loggedIn } = await chrome.storage.sync.get("loggedIn");
                        if (loggedIn) {
                            const data = getAdData(adCardElement, popupCategoryValue);
                            showSavingBar(adCardElement); // Pass the correct ad card
                            sendPostRequest(data, adCardElement); // Pass the correct ad card
                            tippyInstance.hide(); // Use Tippy's method to hide, which will trigger onHidden
                        } else {
                            logInMessage("Por favor haz clic el ícono de la extensión que se encuentra en esta misma pestaña, en la esquina superior derecha para iniciar sesión");
                        }
                    }
                });

                const selectedCategoryDisplay = tippyInstance.popper.querySelector("#selectedCategory");
                if (selectedCategoryDisplay) {
                    selectedCategoryDisplay.style.cursor = "pointer";
                    selectedCategoryDisplay.addEventListener("click", async function () {
                        await loadCategories({
                            container: optionsBox,
                            onSelect : updateName, // updateName should be defined below
                            beforeRender(){ optionsBox.querySelectorAll(".category_name").forEach(e=>e.remove()); }
                        });
                
                        const searchDiv = tippyInstance.popper.querySelector(".search");
                        if(searchDiv) searchDiv.style.display = "none";
                        const adCategoryBtn = tippyInstance.popper.querySelector("#adCategoryBtn");
                        if(adCategoryBtn) adCategoryBtn.remove();
                        
                        const searchInputElement = tippyInstance.popper.querySelector(".search input");
                        if(searchInputElement){
                            searchInputElement.classList.add("searchText");
                            searchInputElement.classList.remove("add-category");
                            searchInputElement.setAttribute("placeholder", "Buscar una categoría");
                        }
                        selectWrapper.classList.toggle("active");
                        optionsBox.style.display = selectWrapper.classList.contains("active") ? "block" : "none";
                        if (downbtn) {
                            downbtn.style.transform = selectWrapper.classList.contains("active") ? "rotate(180deg)" : "rotate(0deg)";
                            if(selectWrapper.classList.contains("active")) downbtn.classList.add("active"); else downbtn.classList.remove("active");
                        }
                    });
                }

                const addImageButton = tippyInstance.popper.querySelector(".add-image");
                if (addImageButton) {
                    addImageButton.style.cursor = "pointer";
                    addImageButton.addEventListener("click", () => {
                        const searchDiv = tippyInstance.popper.querySelector(".search");
                        if(searchDiv) searchDiv.style.display = "block";
                        if(searchInput) { // Check if searchInput was found
                            searchInput.style.width = "80% !important";
                            searchInput.classList.add("add-category");
                            searchInput.setAttribute("placeholder", "Añadir una categoría");
                            searchInput.classList.remove("searchText");
                        }
                        if(optionsBox) optionsBox.style.display = "none";
                        if(downbtn) downbtn.style.transform = "rotate(0deg)";

                        const searchActionDiv = tippyInstance.popper.querySelector(".search");
                        if (searchActionDiv && !searchActionDiv.querySelector("#adCategoryBtn")) {
                            const addDiv = document.createElement("div");
                            addDiv.setAttribute("style","display: flex; justify-content:center; margin-top:5px;");
                            const addBtn = document.createElement("button");
                            addBtn.classList.add("selectBtn"); addBtn.id = "adCategoryBtn"; addBtn.innerText = "Añadir categoría";
                            addBtn.addEventListener("click", async () => {
                                const myToken = await chrome.runtime.sendMessage({type: "getToken"});
                                if (!myToken || !myToken.token) { // Simplified check
                                    MessagePopup("Por favor Inicia Sesión para Crear Categoría");
                                    console.log("myToken.token is undefined or does not have a string value");
                                    return;
                                }
                                const newCategory = searchInput ? searchInput.value : ""; // Check searchInput
                                const messageDiv = tippyInstance.popper.querySelector("#popup_message"); // Scope to popper
                                if (newCategory.length > 0) {
                                    if(searchInput) searchInput.value = "";
                                    const data = await postCategory(newCategory);
                                    // categ = await getCategories(); // 'categ' was global, consider if still needed or how to update list
                                    if(messageDiv) {
                                        messageDiv.innerText = data?.message || "Categoría procesada.";
                                        messageDiv.setAttribute("style","text-align:center; color:green;");
                                    }
                                    setTimeout(() => { if(messageDiv) messageDiv.innerText = "";}, 2000);
                                } else {
                                    if(messageDiv){
                                        messageDiv.innerText = "Por favor ingresa una categoría";
                                        messageDiv.setAttribute("style", "text-align:center; color:red;");
                                        setTimeout(() => { if(messageDiv) messageDiv.innerText = ""; }, 2000);
                                    }
                                }
                            });
                            addDiv.appendChild(addBtn);
                            searchActionDiv.appendChild(addDiv);
                        }
                        if(selectWrapper) selectWrapper.classList.toggle("active");
                    });
                }
                
                async function updateName(e) {
                  const selectedLi = e.currentTarget;
                  if (selectedLi?.textContent) {
                    if(searchInput) searchInput.value = "";
                    if(selectWrapper) selectWrapper.classList.remove("active");
                    if(downbtn) downbtn.style.transform = "rotate(0deg)";
                    if(selectBtn && selectBtn.firstElementChild) selectBtn.firstElementChild.textContent = selectedLi.textContent;
                    // selectBtn.setAttribute("value", selectedLi.getAttribute("value")); // Original, on a div
                    popupCategoryValue = selectedLi.dataset.code; // Uses data-code
                  }
                }

                await loadCategories({
                  container: optionsBox,
                  onSelect : updateName,
                  beforeRender(){ if(optionsBox) optionsBox.querySelectorAll(".category_name").forEach(e=>e.remove()); }
                });

                if(searchInput && optionsBox){
                    searchInput.addEventListener("keyup", () => {
                        let arrSearch = []; // Original search logic was incomplete
                        let searchedLang = searchInput.value.toLowerCase();
                        optionsBox.innerHTML = arrSearch.length > 0 ? arrSearch.map(item => `<li>${item}</li>`).join('') : `<p style="color: black;">Category not found</p>`;
                    });
                }
                
                const dropdownImageBtn = tippyInstance.popper.querySelector(".dropdown-image");
                if (dropdownImageBtn && selectWrapper && optionsBox && downbtn && searchInput) { // Check elements
                    dropdownImageBtn.style.transition = "transform 0.2s linear";
                    dropdownImageBtn.addEventListener("click", async () => {
                        await loadCategories({
                            container: optionsBox,
                            onSelect : updateName,
                            beforeRender(){ optionsBox.querySelectorAll(".category_name").forEach(e=>e.remove()); }
                        });
                        const searchDiv = tippyInstance.popper.querySelector(".search");
                        if(searchDiv) searchDiv.style.display = "none";
                        const adCategoryBtn = tippyInstance.popper.querySelector("#adCategoryBtn");
                        if(adCategoryBtn) adCategoryBtn.remove();

                        const searchInputElement = tippyInstance.popper.querySelector(".search input");
                        if(searchInputElement){
                            searchInputElement.classList.add("searchText");
                            searchInputElement.classList.remove("add-category");
                            searchInputElement.setAttribute("placeholder", "Buscar una categoría");
                        }
                        selectWrapper.classList.toggle("active");
                        optionsBox.style.display = selectWrapper.classList.contains("active") ? "block" : "none";
                        if (downbtn) {
                             downbtn.style.transform = selectWrapper.classList.contains("active") ? "rotate(180deg)" : "rotate(0deg)";
                             if(selectWrapper.classList.contains("active")) downbtn.classList.add("active"); else downbtn.classList.remove("active");
                        }
                    });
                }
            } else {
                console.error("adCategoryPopup: One or more essential elements for UI setup not found in popper.");
            }
            // Original: popup.popperInstance.update();
            // 'this' is the tippyInstance, so:
            if (tippyInstance.popperInstance) {
                 tippyInstance.popperInstance.update(); 
            }
        }, 0); // End of setTimeout
      },
      onHidden: function() {
          // When this specific popup is hidden.
          if (activePopup === this) {
              activePopup = null;
          }
          // **Crucial for manually triggered, re-creatable popups:**
          // Destroy the instance when it's hidden to ensure a fresh state next time.
          this.destroy();
      }
    });
    return popup;
}

  //bulk category
  function categoryPopup() {
    const robotElement = document.querySelector("#robot");

    // **Crucial Defensive Destruction:**
    // Ensure any Tippy instance on #robot is destroyed before creating a new one.
    if (robotElement && robotElement._tippy) {
        robotElement._tippy.destroy();
    }

    const popup = tippy(document.querySelector("#robot"), {
      allowHTML: true,
      trigger: "manual",
      content: categoryHTML,
      sticky: true,
      interactive: true,
      arrow: false,
      placement: "top",
      appendTo: () => LIBRARY_FILTER(), 
      // Inside the categoryPopup function, the onShown callback would be modified like this:

      onShown: function () { // The 'popup' instance is implicitly available as 'this' inside Tippy's lifecycle methods if needed,
        // or the 'popup' variable from the outer scope of categoryPopup if it's defined there.
        // Let's assume 'popup' is accessible from the scope where categoryPopup is defined.
      const tippyInstance = this; // 'this' refers to the Tippy instance here.

      setTimeout(async () => {
        robotCategoryValue = undefined;
        document.querySelector("#categoryHeader").innerText = "Guardado Automático";

        document.querySelector("#automation").removeAttribute("style");

        const selectWrapper = document.querySelector(".select-wrapper");
        const selectBtn = selectWrapper.querySelector(".select-btn");
        const searchInput = selectWrapper.querySelector(".searchText"); // Ensure this selector is correct for the input field
        const optionsBox = selectWrapper.querySelector(".options");
        const downbtn = document.querySelector(".dropdown-image");

        // Event listener for the "Add Image" button (plus icon)
        const addImageButton = document.querySelector(".add-image");
        if (addImageButton) {
        addImageButton.style.cursor = "pointer";
        addImageButton.addEventListener("click", () => {
        document.querySelector(".search").style.display = "block";
        if (searchInput) {
        searchInput.style.width = "80% !important"; // Consider using class for styling
        searchInput.classList.add("add-category");
        searchInput.setAttribute("placeholder", "Añadir una categoría");
        searchInput.classList.remove("searchText"); // Ensure this class toggling is intended
        }
        document.querySelector(".options").style.display = "none";
        if (downbtn) {
        downbtn.style.transform = "rotate(0deg)";
        // Assuming 'active' class handles rotation, ensure it's removed if necessary
        // downbtn.classList.remove("active"); 
        }

        const searchDiv = document.querySelector(".search");
        if (searchDiv && !searchDiv.querySelector("#adCategoryBtn")) { // Check if button already exists
        const addDiv = document.createElement("div");
        addDiv.setAttribute(
            "style",
            "display: flex; justify-content:center; margin-top:5px;"
        );
        const addBtn = document.createElement("button");
        addBtn.classList.add("selectBtn");
        addBtn.id = "adCategoryBtn";
        addBtn.innerText = "Añadir categoría";
        addBtn.addEventListener("click", async () => {
            const newCategoryValue = searchInput ? searchInput.value : "";
            const messageDiv = document.querySelector("#popup_message"); // Ensure #popup_message exists in categoryHTML

            if (newCategoryValue.length > 0) {
                if(searchInput) searchInput.value = ""; // Clear input
                try {
                    const data = await postCategory(newCategoryValue); // Ensure postCategory is defined and handles errors
                    if (messageDiv) {
                        messageDiv.innerText = data?.message || "Categoría procesada.";
                        messageDiv.setAttribute(
                            "style",
                            "text-align:center; color:green;"
                        );
                    }
                    // Consider reloading categories or updating UI after adding
                    // await loadCategories(...); 
                } catch (error) {
                    console.error("Error posting category:", error);
                    if (messageDiv) {
                        messageDiv.innerText = "Error al añadir categoría.";
                        messageDiv.setAttribute(
                            "style",
                            "text-align:center; color:red;"
                        );
                    }
                }
            } else {
                if (messageDiv) {
                    messageDiv.innerText = "Por favor ingresa una categoría";
                    messageDiv.setAttribute("style", "text-align:center; color:red;");
                }
            }
            if (messageDiv) {
                setTimeout(() => {
                    messageDiv.innerText = "";
                }, 2000);
            }
        });
        addDiv.appendChild(addBtn);
        searchDiv.appendChild(addDiv);
        }
        if (selectWrapper) selectWrapper.classList.toggle("active"); // This seems to control the overall dropdown visibility
        });
        }

        async function updateName(e) {
        const selectedLi = e.currentTarget;
        if (selectedLi?.textContent) {
        if (searchInput) searchInput.value = "";

        robotCategoryValue = selectedLi.dataset.code; // Using data-code as per loadCategories
        if(selectWrapper) selectWrapper.classList.remove("active");
        if(downbtn) {
        downbtn.style.transform = "rotate(0deg)";
        // downbtn.classList.remove("active");
        }
        if(selectBtn) selectBtn.firstElementChild.textContent = selectedLi.textContent;
        // The original code sets 'value' attribute on selectBtn, but it's a div. Storing in dataset might be better.
        if(selectBtn) selectBtn.setAttribute("data-value", selectedLi.dataset.code); // Example: using data-value
        }
        }

        if (optionsBox) {
        await loadCategories({
        container: optionsBox,
        onSelect: updateName,
        beforeRender() { optionsBox.querySelectorAll(".category_name").forEach(el => el.remove()); }
        });
        }

        if (tippyInstance.popperInstance) {
        tippyInstance.popperInstance.update(); // keep it aligned after DOM changes
        }

        if (searchInput && optionsBox) {
        searchInput.addEventListener("keyup", () => {
        // The original search logic was incomplete.
        // It cleared optionsBox and showed "Category not found" on every keyup.
        // For a functional search, you'd filter the items from `loadCategories` or re-fetch.
        // Preserving original behavior for now:
        let arrSearch = []; // This will always be empty with the current logic
        let searchedLang = searchInput.value.toLowerCase();
        optionsBox.innerHTML = arrSearch.length > 0 // This condition will always be false
        ? arrSearch.map(item => `<li>${item}</li>`).join('') // Placeholder for actual search result rendering
        : `<p style="color: black;">Category not found</p>`; // Added style for visibility
        });
        }

        const selectedCategoryElement = document.querySelector("#selectedCategory");
        if (selectedCategoryElement) {
        selectedCategoryElement.style.cursor = "pointer";
        selectedCategoryElement.addEventListener("click", async function () {
        if (optionsBox) {
        await loadCategories({ // Reload categories on click
            container: optionsBox,
            onSelect: updateName,
            beforeRender() { optionsBox.querySelectorAll(".category_name").forEach(el => el.remove()); }
        });
        }
        if(document.querySelector(".search")) document.querySelector(".search").style.display = "none";
        if(document.querySelector("#adCategoryBtn")) document.querySelector("#adCategoryBtn").remove();

        if (searchInput) {
        searchInput.classList.add("searchText");
        searchInput.classList.remove("add-category");
        searchInput.setAttribute("placeholder", "Buscar una categoría");
        }
        if(selectWrapper) selectWrapper.classList.toggle("active");
        if(optionsBox) optionsBox.style.display = "block";

        if (downbtn) {
        const isActive = selectWrapper ? selectWrapper.classList.contains("active") : false;
        downbtn.style.transform = isActive ? "rotate(180deg)" : "rotate(0deg)";
        // if (isActive) downbtn.classList.add("active");
        // else downbtn.classList.remove("active");
        }
        });
        }

        if (downbtn) {
        downbtn.style.transition = "transform 0.2s linear";
        // This click listener might be redundant if #selectedCategory handles the dropdown toggle.
        // However, keeping it as per original logic.
        downbtn.addEventListener("click", async () => {
        if (optionsBox) {
        await loadCategories({
            container: optionsBox,
            onSelect: updateName,
            beforeRender() { optionsBox.querySelectorAll(".category_name").forEach(el => el.remove()); }
        });
        }
        if(document.querySelector(".search")) document.querySelector(".search").style.display = "none";
        if(document.querySelector("#adCategoryBtn")) document.querySelector("#adCategoryBtn").remove();

        if (searchInput) {
        searchInput.classList.add("searchText");
        searchInput.classList.remove("add-category");
        searchInput.setAttribute("placeholder", "Buscar una categoría");
        }
        if(selectWrapper) selectWrapper.classList.toggle("active");
        if(optionsBox) optionsBox.style.display = "block";

        const isActive = selectWrapper ? selectWrapper.classList.contains("active") : false;
        downbtn.style.transform = isActive ? "rotate(180deg)" : "rotate(0deg)";
        // if (isActive) downbtn.classList.add("active");
        // else downbtn.classList.remove("active");
        });
        }

        const automationButton = document.querySelector("#automation"); // This was .selectBtn
          if (automationButton) {
              automationButton.addEventListener("click", async () => {
              const robotIcon = document.querySelector("#robot"); // Assuming #robot is the icon
              if (robotIcon && robotIcon.classList.contains("active")) {
              robotIcon.setAttribute("src", robotInctive); // Ensure robotInctive is defined
              robotIcon.classList.remove("active");
              chrome.storage.local.set({ robotStatus: "inactive" });
              } else {
              const { loggedIn } = await chrome.storage.sync.get("loggedIn");
              if (loggedIn) {
                  // robotCategoryValue should be set by updateName when a category is selected.
                  // The original code was:
                  // robotCategoryValue = document.querySelector("#selectedCategory").parentElement.getAttribute("value");
                  // This should now correctly use the robotCategoryValue variable set by updateName.

                  if (robotCategoryValue) { // Check if a category was actually selected
                      if (robotIcon) {
                          robotIcon.classList.add("active");
                          robotIcon.setAttribute("src", robotActive); // Ensure robotActive is defined
                      }
                      chrome.storage.local.set({ robotStatus: "active" });
                      checkFilterValue(robotCategoryValue); // Ensure checkFilterValue is defined
                      tippyInstance.hide(); // Hide the popup after action
                  } else {
                      MessagePopup("Por favor seleccione una categoría"); // Ensure MessagePopup is defined
                  }
              } else {
                  logInMessage("Por favor haz clic el ícono de la extensión que se encuentra en esta misma pestaña, en la esquina superior derecha para iniciar sesión"); // Ensure logInMessage is defined
              }
              }
              });
          }
          // Ensure popper instance is updated if content changes dynamically
          if (tippyInstance.popperInstance) {
              tippyInstance.popperInstance.update();
          }
        }, 0); // End of setTimeout
      },
      onHidden: function() {
        // When this specific popup is hidden, if it was the active one, clear activePopup.
        // This is important if it's hidden programmatically (e.g., by tippyInstance.hide())
        // rather than hideActivePopup() being called for a different popup.
        if (activePopup === this) {
            activePopup = null;
        }
        // Optional: Destroy on hide if you always want it recreated fresh.
        // However, the click handler and categoryPopup entry already destroy, so this might be redundant
        // unless it can be hidden by other means (e.g., clicking outside if interactive: 'reference').
        // For 'manual' trigger, usually explicit destruction is better handled by the trigger logic.
        // this.destroy(); 
      }
    });
    return popup;
  }

  async function loadCategories({
    container,            // UL o DIV donde se pintan <li>
    onSelect,             // callback que recibe el <li> clicado
    beforeRender = () => {} // opcional: tareas previas al pintado
  }) {
    /* ① Mostrar loader */
    showLoader(container.closest(".tippy-box") || container);    
    let response;
    try {
      response = await getCategories();              // llamada remota
      if (!response || !Array.isArray(response.data)) {
        throw new Error("Respuesta sin datos de categorías");
      }
    } catch (err) {
      console.error("[ClicSpy] Categorías no disponibles:", err);
      MessagePopup("No se pudieron cargar las categorías"); // función ya existente
      return;
    }
  
    /* Limpiar contenedor y renderizar */
    beforeRender();                    // p. ej. -> container.innerHTML = ""
    container.innerHTML = "";          // siempre se limpia
    response.data.forEach(cat => {
      const li  = document.createElement("li");
      li.className = "category_name";
      li.setAttribute("data-code", cat.FK_Category_Code);
      li.innerText = cat.Category_Name;
      li.addEventListener("click", onSelect);      
      container.appendChild(li);
    });

      /* ③ Ocultar loader */
    hideLoader(container.closest(".tippy-box") || container);
  }

  /* Inserta el CSS solo la primera vez */
(function injectLoaderCSS () {
  if (document.getElementById("clicspy-loader-style")) return;        // evita duplicados
  const style = document.createElement("style");
  style.id  = "clicspy-loader-style";
  style.textContent = `
    /* Barra fina en la parte superior del popup */
    .cspy-loader{
      position:relative;
      width:100%;
      height:4px;
      overflow:hidden;
      background:rgba(0,0,0,0.1);
      border-radius:4px 4px 0 0;
      margin-bottom:6px;
    }
    .cspy-loader::before{
      content:"";
      position:absolute;
      inset:0;
      width:40%;
      background:#6F58F4;                   /* color corporativo */
      animation:cspy-slide 1.2s linear infinite;
    }
    @keyframes cspy-slide{
      0%{transform:translateX(-100%);}
      100%{transform:translateX(250%);}
    }
  `;
  document.head.appendChild(style);
})();

//mostrar barra de progreso para cargar categorias
function showLoader(target){
  if (target.querySelector(".cspy-loader")) return;        // ya visible
  const loader = document.createElement("div");
  loader.className = "cspy-loader";
  target.prepend(loader);
}

function hideLoader(target){
  target.querySelector(".cspy-loader")?.remove();
}


  let scrollingInterval = undefined;

  async function checkFilterValue(categoryCode) {
    const adsFilter = document.getElementById("adsnumber");
    const ads = Number(adsFilter.value);
    if (ads) {
      startScrolling();
      startSendingData(categoryCode);
    } else {
      startScrolling();
      adsFilter.value = "1";
      dispatchInputEvent(adsFilter);
      dispatchChangeEvent(adsFilter);
      dispatchMouseUpEvent(adsFilter);
      await new Promise((rs, rj) => setTimeout(rs, 3000));
      startSendingData(categoryCode);
    }
  }

  async function postCategory(categoryName) {
    const apiUrl = "https://nodeapi.tueducaciondigital.site/usercategory";
    const myToken = await chrome.runtime.sendMessage({ type: "getToken" });
    console.log(myToken);
    const requestBody = {
      Category_Name: `${categoryName}`,
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization":  `Bearer ${myToken.token}`
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {

        // EXCEDIO LA CAPACIDAD DE CATEGORIAS
        if(response.status === 400){
          showPopup("Has alcanzado el límite de categorías permitidas para tu plan. Contactanos a soporte@pulpoia.com", true)
          return ""
        }
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("Response:", data);
      return data;
      // You can handle the response data here
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
    }
  }

  async function getCategories() {
    myToken = await chrome.runtime.sendMessage({ type: "getToken" });
    try {
      
      const response = await fetch(
        `https://nodeapi.tueducaciondigital.site/usercategory`,
        
        {
          method: "GET",
          headers: {
            "Authorization":  `Bearer ${myToken.token}`
            
          },
        }
      );
      
      if (!response.ok) {
        document.querySelector('[id*="tippy"]')?.remove();
        // logInMessage("Por favor haz clic el ícono de la extensión que se encuentra en esta misma pestaña, en la esquina superior derecha para iniciar sesión")
        chrome.runtime.sendMessage({ msg: "OpenLogin" });
        throw new Error("Could not fetch data");
      }
      const data = await response.json();
      // Do something with the fetched data here
      // console.log(data);
      return data;
    } catch (error) {
      console.error("Error fetching data:", error);
      return false;
    }
  }

  function startScrolling() {
    const SCROLL_DELAY = 14000; // Delay in milliseconds
    const SCROLL_AMOUNT = 100; // Amount to scroll in pixels

    scrollingInterval = setInterval(() => {
        window.scrollBy({ top: SCROLL_AMOUNT, behavior: "smooth" });
    }, SCROLL_DELAY);
}

  async function startSendingData(categoryCode) {
    let dataArray4 = [];
    const { selectedCatg } = await chrome.storage.local.get("selectedCatg");
    selectedMainCategory = selectedCatg;
    let sendingDataInterval = setInterval(async () => {
      const { robotStatus } = await chrome.storage.local.get("robotStatus");
      if (robotStatus == "active") {
        const ads = document.querySelectorAll(".card-shadow:not(.sent)");
        if (ads.length >= 4) {
          for (let i = 0; i < 4; i++) {
            let ad = ads[i];
            if (!ad.classList.contains("sent")) {
              ad.classList.add("sent");
              ad.style.backgroundColor = "#91C8E4";
              let data = getAdData(ad, categoryCode);
              dataArray4.push(data);
            }
          }
        }
      } else {
        clearInterval(sendingDataInterval);
        clearInterval(scrollingInterval);
      }

      if (dataArray4.length == 4) {

        postBulkData(dataArray4);
        dataArray4 = [];
      }
    }, 4000);
  }

  function getAdData(n, categoryCode) {
    chrome.storage.local.set({ selectedCatg: categoryCode });

    const regex = /\d+/g;

    //TODO: REVISAR ESTA LIENA
    let ad_status = n.querySelectorAll(
      '[class*="x8t9es0 xw23nyj xo1l8bm x63nzvj x108nfp6 xq9mrsl x1h4wwuj xeuugli"]'
    )[1]?.innerText;
    
    console.log("ad_status is " + ad_status)

    if (ad_status === "Activo") {
      ad_status = true;
    } else {
      ad_status = false;
    }

    //the hyperlink of the image or video
    var ahref =
      n.querySelector('[class*="x1yc453h x1h4wwuj x1fcty0u x1lliihq"]') ||
      "N/A";

    //limpiar la url del sitio web a la que se dirige el anuncio
    if (ahref !== "N/A") {
      const decodedUrl = decodeURIComponent(ahref);

      // Remove the specified prefix
      ahref = decodedUrl.replace("https://l.facebook.com/l.php?u=", "");

      const startIndex = 0; // starting index (inclusive)

      //remover query string
      var endSize = ahref.indexOf("&h=AT");

      ahref = ahref.substring(startIndex, endSize);
    }

    //get the ads duplicated
    var duplicates =
      n.querySelector('[class*="x6s0dn4 x78zum5 xsag5q8"]') || "N/A";

    var duplicated = extractNumber(duplicates.textContent);

    var mediaImage = n
      .querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
      ?.querySelector("img")?.src;
    var mediaVideo = n
      .querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
      ?.querySelector("video")?.src;
    var adMedia = "";

    if (typeof mediaImage === "undefined") {
      adMedia = "video";
    } else {
      adMedia = "img";
    }

    // console.log("el div de descripción ", n.querySelectorAll('[class*="_4ik4 _4ik5"]')[1])
    //var OriginalAdDescription = n.querySelectorAll('[class*="_4ik4 _4ik5"]')[1].innerText || "N/A";
    
    var OriginalAdDescription = ""

    var containers = n.querySelectorAll('[class*="_4ik4 _4ik5"]');

  
    if (containers.length > 1 && containers[1].querySelector('span') !== null) {
      OriginalAdDescription = containers[1].querySelector('span').innerHTML;
    } else {
      OriginalAdDescription = "";
    }
    

    var AdDescription = "";

    // adding <br> to the description
    if (OriginalAdDescription.indexOf("\n") > 0) {
      AdDescription = replaceNewlinesWithBR(OriginalAdDescription);
    } else {
      AdDescription = OriginalAdDescription;
    }

    // add <a href> if http is found
    if (OriginalAdDescription.indexOf("http") > 0) {
      AdDescription = addLinksToUrls(AdDescription);
    }

    let currentDate = String(new Date());
    console.log("ad_status antes de formar data es: " + ad_status)
    let data = {
      // Category: selectedMainCategory,
      LibraryID:
        n
          .querySelector(
            '[class*="x8t9es0 xw23nyj xo1l8bm x63nzvj x108nfp6 xq9mrsl x1h4wwuj xeuugli"]'
          )
          ?.innerText.match(regex)[0] || "N/A",
      Active: 1,
      Estatus: ad_status,
      FK_Category_Code: categoryCode || "Todos",
      PostDT:
        n
          .querySelectorAll(
            '[class*="x8t9es0 xw23nyj xo1l8bm x63nzvj x108nfp6 xq9mrsl x1h4wwuj xeuugli"]'
          )[2]
          ?.innerText.split("on")[1]
          ?.trim() || "2023-11-23",
      Plataformas: currentDate,
      FK_PlatformID: "1",
      FanPageName:
        n.querySelector(
          '[class*="xt0psk2 x1hl2dhg xt0b8zv x8t9es0 x1fvot60 xxio538 xjnfcd9 xq9mrsl x1yc453h x1h4wwuj x1fcty0u"]'
        )?.innerText || "N/A",
      AdDescription: AdDescription, //n.querySelectorAll('[class*="_4ik4 _4ik5"]')[1].innerText || 'N/A',
      ahref: ahref,
      Duplicated: duplicated,
      AdTitle:
        n
          .querySelector(
            '[class*="x1hl2dhg x1lku1pv x8t9es0 x1fvot60 xxio538 xjnfcd9 xq9mrsl x1yc453h x1h4wwuj x1fcty0u x1lliihq"]'
          )
          ?.querySelectorAll('[class*="_4ik4 _4ik5"]')[1]?.innerText || "N/A",
      AdCreative:
        n
          .querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
          ?.querySelector("img")?.src ||
        n
          .querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
          ?.querySelector("video")?.src ||
        "N/A",
      AdMedia: adMedia,
    };

    return data;
  }

  
  function addLinksToUrls(inputText) {
    // Regular expression to match URLs
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    // Replace URLs with <a> tags
    const textWithLinks = inputText.replace(
      urlRegex,
      (url) => `<a href='${url}' target='_blank'>${url}</a>`
    );

    return textWithLinks;
  }

  function replaceNewlinesWithBR(inputString) {
    // Use a regular expression with the global flag (/g) to replace all occurrences
    // of "\n" with "<br/>" in the input string.
    return inputString.replace(/\n/g, "<br/>");
  }
  function extractNumber(text) {
    // Check if the input is a non-null string
    if (typeof text === "string" && text.trim() !== "") {
      // Use a regular expression to match numbers in the text
      const matches = text.match(/\d+/);

      // Check if a number was found
      if (matches) {
        // Convert the matched string to a number and return it
        return parseInt(matches[0], 10);
      }
    }

    // Return null if no valid number was found
    return null;
  }
  async function postBulkData(postData) {
    let data = {
      ads: postData,
    };

    chrome.runtime.sendMessage(
      {
        msg: "sendBulkData",
        data: data,
      },
      (res) => {
        console.log(res);
      }
    );
  }

  async function removeElementFromArray(arr, elementToRemove) {
    const indexToRemove = arr.indexOf(elementToRemove);
    const { selectedCatg } = await chrome.storage.local.get("selectedCatg");

    if (indexToRemove !== -1) {
      arr.splice(indexToRemove, 1);
      if (selectedCatg == elementToRemove) {
        chrome.storage.local.set({ selectedCatg: null }, () => { });
        document.querySelector("#selectedCategory").innerText = "";
      }
    }

    chrome.storage.local.set({ storedCategory: arr });
    return arr;
  }

  let status = undefined;
  function statusPopup() {
    // Destroy any existing tippy instance on the element before creating a new one
    const existingTippy = document.querySelector(".newFilter")._tippy;
    if (existingTippy) {
        existingTippy.destroy();
    }

    const popup = tippy(document.querySelector(".newFilter"), {
      allowHTML: true,
      trigger: "manual",
      content: stautsHTML,
      sticky: true,
      interactive: true,
      arrow: false,
      placement: "top",
      appendTo: LIBRARY_FILTER, 
        onShow: function () {  // Replaced onShown with onShow
            setTimeout(() => {
        status = getActiveStatusFromUrl();
        document.querySelector(`[value="${status}"]`).setAttribute("checked", true);
        replaceStatusValue(status);
        document.querySelectorAll('[name="status"]').forEach((e) => {
          e.addEventListener("click", (el) => {
                        el.stopPropagation(); // Prevent propagation within the popup
            replaceStatusValue(el.target.value);
            window.location.href = updateActiveStatus(
              window.location.href,
              el.target.value
            );
          });
        });

        // Get the element with the ID "tippy"
        var tippyElement = document.querySelector("[id*=tippy]");

        // Get the element with the ID "library-filter"
        var libraryFilterElement = document.getElementById("library-filter");

        // Check if both elements exist
        /*if (tippyElement && libraryFilterElement) {
          // Add tippyElement as the first child of libraryFilterElement
          libraryFilterElement.insertBefore(
            tippyElement,
            libraryFilterElement.firstChild
          );
        } else {
          console.error("One or both of the elements not found.");
        }*/

            }, 0); // Delay to ensure everything is rendered before proceeding
      },
        onHide: function() {  // Added onHide for cleanup or additional actions when the popup is hidden
            console.log("Popup hidden, cleanup if necessary");
            // Add any necessary cleanup actions here, such as removing event listeners or resetting state
            activePopup = null; // Reset active popup when hidden
        }
    });
    return popup;
  }

  

  function replaceStatusValue2() {
    const value = getActiveStatusFromUrl();
    if (value == "active") {
      return "Activos";
    }
    if (value == "inactive") {
      return "Inactivos";
    }
    if (value == "all") {
      return "Activos e inactivos";
    }
  }

  async function replacePlateform() {
    // const url = window.location.href;
    // const urlObject = new URL(url);
    // const searchParams = urlObject.searchParams;
    // const publisherPlatformValue = searchParams.get('publisher_platforms[0]');
    setTimeout(async () => {
      const { cta } = await chrome.storage.local.get('cta')
      if (cta) {
        CTA = cta;
      }

      publisherPlatformValue = cta;
      const selectPlateformLabel = document.querySelector("#selectplateform>label")
      if (selectPlateformLabel) {
        if (publisherPlatformValue == 'Instagram') {
          // return "Instagram"
          selectPlateformLabel.innerText = "Instagram";
        } else if (publisherPlatformValue == "Facebook") {
          // return "Facebook";
          selectPlateformLabel.innerText = "Facebook";

        } else if (publisherPlatformValue == "Whatsapp") {
          // return "Whatsapp";
          selectPlateformLabel.innerText = "Whatsapp";

        } else if (publisherPlatformValue == "Messenger") {
          // return "Messenger";
          selectPlateformLabel.innerText = "Messenger";

        } else if (publisherPlatformValue == "website") {
          // return "Páginas De Aterrizaje";
          selectPlateformLabel.innerText = "Páginas De Aterrizaje"

        } else {
          // return false;
          selectPlateformLabel.innerText = "Todas las URL"

        }
      }

    }, 500);

  }
  function replaceStatusValue(value) {
    if (value == "active") {
      document.querySelector("#selectedStatus").innerText = "Activos";
      document.querySelector('[for="selectStatus"]').innerText = "Activos";
    }
    if (value == "inactive") {
      document.querySelector("#selectedStatus").innerText = "Inactivos";
      document.querySelector('[for="selectStatus"]').innerText = "Inactivos";
    }
    if (value == "all") {
      document.querySelector("#selectedStatus").innerText =
        "Activos e inactivos";
      document.querySelector('[for="selectStatus"]').innerText =
        "Activos e inactivos";
    }
  }

  function getActiveStatusFromUrl() {
    // Get the current URL
    const currentUrl = window.location.href;

    const active_status = currentUrl.split("&")[0].split("=")[1];

    // Return the value
    return active_status;
  }

  function countryPopup() {
    console.log("inside country popup")
    // Destroy any existing tippy instance on the element before creating a new one
    const existingTippy = document.querySelector(".countryFilter")._tippy;
    if (existingTippy) {
      existingTippy.destroy();
    }

    const popup = tippy(document.querySelector(".countryFilter"), {
      allowHTML: true,
      trigger: "manual",
      content: countryHTML,
      sticky: true,
      interactive: true,
      arrow: false,
      placement: "top",
      appendTo: LIBRARY_FILTER, 
        onShow: function () {  // Replaced onShown with onShow
        setTimeout(() => {
          console.log("inside onshow country popup")
        const select_box = document.querySelector(".options"),
          search_box = document.querySelector(".search-box");

        let options = null;

        for (const country of countries) {
          let option;

          if (country.code == "all") {
            console.log(country.code);
            option = `
        <li class="option">
            <div style="display:flex; align-items:center">
            <span class="flag-icon"><img src='${chrome.runtime.getURL(
              "./flags/globe.svg"
            )}'></span>
                <span class="country-name" code="${country.code}" data-label="${country.name
              }">${country.name}</span>
            </div>
        </li> `;
          } else {
            option = `
          <li class="option">
              <div>
                  <span class="flag-icon"><img src='${chrome.runtime.getURL(
              "./flags/" + country.code.toLowerCase() + ".svg"
            )}'></span>

                  <span class="country-name" code="${country.code
              }" data-label="${country.name}">${country.name}</span>
              </div>
          </li> `;
          }

          select_box
            .querySelector("ol")
            .insertAdjacentHTML("beforeend", option);
          options = document.querySelectorAll(".option");
        }

                function selectOption(event) {
                    event.stopPropagation(); // Prevent propagation within the popup
          const country_name = this.querySelector(".country-name").innerText;
          const country_code =
            this.querySelector(".country-name").getAttribute("code");
          if (country_code == "all") {
            document
              .querySelector(`[for="selectCountry"] .flag-icon>img`)
              .setAttribute(
                "src",
                `${chrome.runtime.getURL("/flags/globe.svg")}`
              );
          } else {
            document
              .querySelector(`[for="selectCountry"] .flag-icon>img`)
              .setAttribute(
                "src",
                `${chrome.runtime.getURL(
                  "./flags/" + country_code.toLowerCase() + ".svg"
                )}`
              );
          }

          document.querySelector("#country_name").innerText = country_name;

          select_box.classList.remove("active");

          search_box.value = "";
          select_box
            .querySelectorAll(".hide")
            .forEach((el) => el.classList.remove("hide"));
          replaceCountry(country_code);
        }

        function searchCountry() {
          let search_query = search_box.value.toLowerCase();
          for (let option of options) {
            let is_matched = option
              .querySelector(".country-name")
              .innerText.toLowerCase()
              .includes(search_query);
            option.classList.toggle("hide", !is_matched);
          }
        }

        options.forEach((option) =>
                    option.addEventListener("click", selectOption)
        );
        search_box.addEventListener("input", searchCountry);

        var tippyElement = document.querySelector("[id*=tippy]");

        var libraryFilterElement = document.getElementById("library-filter");

        /*if (tippyElement && libraryFilterElement) {
          // Add tippyElement as the first child of libraryFilterElement
          libraryFilterElement.insertBefore(
            tippyElement,
            libraryFilterElement.firstChild
          );
        } else {
          console.error("One or both of the elements not found.");
        } */

            }, 0); // Delay to ensure everything is rendered before proceeding
      },
        onHide: function() {  // Added onHide for cleanup or additional actions when the popup is hidden
            console.log("Popup hidden, cleanup if necessary");
            // Add any necessary cleanup actions here, such as removing event listeners or resetting state
            activePopup = null; // Reset active popup when hidden
        }
    });
    return popup;
  }

  function replaceCountry(code) {
    // console.log(code);
    var currentURL = window.location.href;
    var countryPattern = /country=([A-Z]{2})/;
    var currentCountryCode = currentURL.match(countryPattern)[1];
    code = code.toUpperCase();
    // console.log(code);
    var newURL = updateCountry(currentURL, code);
    // console.log(newURL);
    // setTimeout(() => {
    window.location.href = newURL;
    // }, 3000);
  }

  let waitToLoadItems = setInterval(async () => {
    if (document.querySelector("[class='xrvj5dj xdq2opy xexx8yu xbxaen2 x18d9i69 xbbxn1n xdoe023 xbumo9q x143o31f x7sq92a x1crum5w'] div.x1plvlek.xryxfnj.x1gzqxud.x178xt8z.xm81vs4.xso031l.xy80clv.xb9moi8.xfth1om.x21b0me.xmls85d.xhk9q7s.x1otrzb0.x1i1ezom.x1o6z2jb.x1kmqopl.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x9f619")) {
      // console.log('loaded successfully');
      var targetElement = document.getElementById("adsnumber");
      const adsNumberResult = await chrome.storage.local.get("adsNumber");
      const adsNumber = adsNumberResult.adsNumber;
      let num = parseInt(adsNumber);
      targetElement.value = num;
      dispatchInputEvent(targetElement);
      dispatchChangeEvent(targetElement);
      dispatchMouseUpEvent(targetElement);
      clearInterval(waitToLoadItems);
    }
  }, 1000);

  async function changeFilterValue() {
    const { adsNumber } = await chrome.storage.local.get("adsNumber");

    let adsNum = Number(adsNumber);

    if (adsNum) {
      const adsFilter = document.getElementById("adsnumber");
      adsFilter.value = adsNum;
      dispatchInputEvent(adsFilter);
      dispatchChangeEvent(adsFilter);
      dispatchMouseUpEvent(adsFilter);

      console.log("Extension enabled ///// ");
    }
  }

  function showToolBar(active) {
    console.log('show tool bar');
    console.log(active);
    active ? (document.getElementById("library-filter").style.display = "block") : (document.getElementById("library-filter").style.display = "none");
  }

  let valueBeforeDeactivation = undefined;
  function activateTool(isActive) {
    if (isActive) {
      document.getElementById("library-filter").style.display = "block";
      chrome.storage.local.get("adsNumber", (result) => {
        filterChange(valueBeforeDeactivation || result.adsNumber || 0);
      });
    } else {
      valueBeforeDeactivation = Number(
        document.getElementById("adsnumber").value
      );
      chrome.storage.local.set({ adsNumber: 8 }).then(() => {
        filterChange(0);
      });
      document.getElementById("library-filter").style.display = "none";
    }
  }

  let deactivationTimeout = undefined;

  

 

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    let message = request?.statusMessage;

    if (message == true) {

      //cancel the deactivation timeout
      clearTimeout(deactivationTimeout);
      const extDiv = document.querySelector("#extension_status");

      if (!extDiv) {
        const div = document.createElement("div");
        div.id = "extension_status";
        document.body.append(div);
      }
      //if the UI is set to be removed, we will not add it again
      else {
        extDiv.dataset.willRemove = "false";
      }
      extension_status = "active";

      activateTool(true);


    } else if (message == false) {
      //remove secondary UI
      activateTool(false);

      const extDiv = document.querySelector("#extension_status");
      if (extDiv) extDiv.dataset.willRemove = "true";

      //we need a timeout because activateTool() takes some time to remove the UI
      //it will not work if extension_status is set to inactive before the UI is removed
      //willRemore is needed to tell the main function not to add the UI again
      deactivationTimeout = setTimeout(() => {
        document.querySelector("#extension_status")?.remove();
        extension_status = "inactive";
      }, 4000);

      // filterValue = Number(document.getElementById("adsnumber").value);
      // filterChange(0)
    } else if (request.justLoggedIn) {
      //reload
      window.location.reload();
    }
  });

  // setInterval(() => {
  //   if (document.querySelector("#extension_status")) {
  //     chrome.storage.local.set({ chrome_extension_status: "active" }, () => { "set active "; });
  //   } else {
  //     chrome.storage.local.set({ chrome_extension_status: "inactive" }, () => { "set inactive"; });
  //   }
  // }, 500);

  function filterChange(adsNum) {
    console.log('filetr changed');
    const adsFilter = document.getElementById("adsnumber");
    adsFilter.value = adsNum;
    dispatchInputEvent(adsFilter);
    dispatchChangeEvent(adsFilter);
    dispatchMouseUpEvent(adsFilter);
    console.log("Extension enabled ///// ");
  }

  function applyDateFilter() {
    from_date = document.querySelector("#from_date").value;
    to_date = document.querySelector("#to_date").value;

    to_date = addOneDayToDate(to_date);
    const updatedURL = updateStartDate(
      window.location.href,
      from_date,
      to_date
    );
    console.log(updatedURL);
    // setTimeout(() => {
    window.location.href = updatedURL;

    // }, 3000);
  }

  function addOneDayToDate(inputDate) {
    const dateObject = new Date(inputDate);
    dateObject.setDate(dateObject.getDate() + 1);
    const resultDate = dateObject.toISOString().split("T")[0];
    return resultDate;
  }

  function replaceMonth(date) {
    date = date.toLowerCase();
    date = date
      .replace("enero", "jan")
      .replace("ene", "jan")
      .replace("abr", "april")
      .replace("may", "may")
      .replace("mayo", "may")
      .replace("agosto", "aug")
      .replace("ago", "aug")
      .replace("dic", "dec");
    return date;
  }


  function getDaysDifference(startDateStr, endDate) {
    // Parse the input date strings into Date objects
    const startDate = new Date(startDateStr);

    // Calculate the time difference in milliseconds
    const timeDifference = endDate - startDate;

    // Convert the time difference to days
    const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

    return daysDifference;
  }

  function getCountryCode() {
    const countryCode = new URLSearchParams(window.location.href)?.get(
      "country"
    );
    console.log(countryCode);
    if (countryCode == "ALL") {
      return `globe` || "co";
    } else {
      return `${countryCode.toLowerCase()}` || "co";
    }
  }
  function getCountryName() {
    const countryCode = new URLSearchParams(window.location.href).get(
      "country"
    );
    const country = countries.find((country) => country.code === countryCode);

    if (country) {
      return country.name;
    } else {
      return "Todos los paises";
    }
  }

  function dispatchInputEvent(element) {
    var inputEvent = new Event("input", {
      bubbles: true,
      cancelable: true,
    });

    element.dispatchEvent(inputEvent);
  }

  function dispatchChangeEvent(element) {
    var changeEvent = new Event("change", {
      bubbles: true,
      cancelable: true,
    });

    element.dispatchEvent(changeEvent);
  }

  function dispatchMouseUpEvent(element) {
    var mouseUpEvent = new Event("mouseup", {
      bubbles: true,
      cancelable: true,
    });
    element.dispatchEvent(mouseUpEvent);
  }

  function updateMediaType(url, mediaType) {

    const urlObj = new URL(url);
    console.log(mediaType);
    document.querySelector("#selectMediaType>label").innerText = mediaType;
    console.log(mediaType);



    if (mediaType == 'Todos los Contenidos') {
      console.log('entered into Todas las URL');
      console.log(mediaType);
      urlObj.searchParams.set("media_type", 'all');
      // window.location.href=urlObj;
      // chrome.storage.local.set({ cta: 'all' })
      // updateCta('all')
    }
    else if (mediaType == 'Imagen') {
      // urlObj.searchParams.set("publisher_platforms[0]", 'audience_network');
      // chrome.storage.local.set({ cta: 'website' })
      // updateCta('website')
      urlObj.searchParams.set("media_type", 'image');


    }
    else if (mediaType == 'Memes') {
      // urlObj.searchParams.set("publisher_platforms[0]", 'facebook');
      urlObj.searchParams.set("media_type", 'meme');

      // chrome.storage.local.set({ cta: 'Facebook' })
      // updateCta('Facebook')


    }
    else if (mediaType == 'Video') {
      urlObj.searchParams.set("media_type", 'video');

      // urlObj.searchParams.set("publisher_platforms[0]", 'messenger');
      // chrome.storage.local.set({ cta: 'Messenger' })
      // updateCta('Messenger');


    }
    else if (mediaType == 'Sin Imagen y Video') {
      // console.log('whatsapp');
      // chrome.storage.local.set({ cta: 'Whatsapp' })
      // updateCta("Whatsapp")

      urlObj.searchParams.set("media_type", 'none');


      // urlObj.searchParams.set("publisher_platforms[0]", 'messenger');
    }
    return urlObj.toString();

  }

  function updatePlateform(url, plateform) {

    const urlObj = new URL(url);
    console.log(plateform);
    document.querySelector("#selectplateform>label").innerText = plateform;
    console.log(plateform);
    if (plateform == 'Todas las URL') {
      console.log('entered into Todas las URL');
      console.log(plateform);
      // urlObj.searchParams.set("publisher_platforms[0]", '');
      chrome.storage.local.set({ cta: 'all' })
      updateCta('all')
    }
    else if (plateform == 'Páginas De Aterrizaje') {
      // urlObj.searchParams.set("publisher_platforms[0]", 'audience_network');
      chrome.storage.local.set({ cta: 'website' })
      updateCta('website')


    }
    else if (plateform == 'Facebook') {
      // urlObj.searchParams.set("publisher_platforms[0]", 'facebook');
      chrome.storage.local.set({ cta: 'Facebook' })
      updateCta('Facebook')


    }
    else if (plateform == 'Messenger') {
      urlObj.searchParams.set("publisher_platforms[0]", 'messenger');
      chrome.storage.local.set({ cta: 'Messenger' })
      updateCta('Messenger');


    }
    else if (plateform == 'Whatsapp') {
      // console.log('whatsapp');
      chrome.storage.local.set({ cta: 'Whatsapp' })
      updateCta("Whatsapp")


      // urlObj.searchParams.set("publisher_platforms[0]", 'messenger');
    }
    else if (plateform == 'Instagram') {
      urlObj.searchParams.set("publisher_platforms[0]", 'instagram');
      chrome.storage.local.set({ cta: 'Instagram' })
      updateCta("Instagram")


    }
    return urlObj.toString();

  }

  async function updateCta(cta) {
    CTA = cta;

    console.log("CTA is this:");
    console.log(cta);
    if (cta) {
      // este es el css class de la tarjeta: x1plvlek.xryxfnj.x1gzqxud.x178xt8z.xm81vs4.xso031l.xy80clv.xb9moi8.xfth1om.x21b0me.xmls85d.xhk9q7s.x1otrzb0.x1i1ezom.x1o6z2jb.x1kmqopl.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x9f619
      const adsList = document.querySelectorAll(".x1plvlek.xryxfnj.x1gzqxud.x178xt8z.xm81vs4.xso031l.xy80clv.xb9moi8.xfth1om.x21b0me.xmls85d.xhk9q7s.x1otrzb0.x1i1ezom.x1o6z2jb.x1kmqopl.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x9f619")
      adsList.forEach(n => {
        n.parentElement.style.display = 'block';
      })
      await new Promise((rs, rj) => setTimeout(rs, 500))
      adsList.forEach(n => {
        // console.log(n.querySelector('[class*="x1yc453h x1h4wwuj x1fcty0u x1lliihq"]'));
        let href = n?.querySelector('[class*="x1yc453h x1h4wwuj x1fcty0u x1lliihq"]')?.href;
        if (href) {
          href = href.replace("https://l.facebook.com/l.php?u=", '')
        } else {
          // console.log('display none');
          // console.log(n);
          // console.log(n.parentElement);
          if (cta != 'all') {
            n.parentElement.style.display = 'none';
            return;
          }
        }
        // console.log('Return trued ');
        console.log(cta);
        n.parentElement.style.display = 'block';
        if (cta == 'all') {

          // console.log('entered all');
          n.parentElement.style.display = 'block';
        }
        else if (cta == 'website') {

          if (href.toLowerCase().includes('instagram.com') ||
            href.toLowerCase().includes('facebook.com') ||
            href.toLowerCase().includes('fb.com') ||
            href.toLowerCase().includes('fb.me') ||
            href.toLowerCase().includes('whatsapp.com') ||
            href.toLowerCase().includes('messenger.com')) {
            // console.log('display none');
            // console.log(n);
            n.parentElement.style.display = 'none';
          } else {
            n.parentElement.style.display = 'block'
          }

        } else if (cta == 'Instagram') {
          if (!href.toLowerCase().includes('instagram.com')) {
            // console.log('display none');
            // console.log(n);
            n.parentElement.style.display = 'none';
          }

        } else if (cta == 'Facebook') {
          // console.log(href);
          // console.log(href.toLowerCase().includes('facebook.com'));
          // console.log(href.toLowerCase().includes('fb.com'));
          if (href.toLowerCase().includes('facebook.com') || href.toLowerCase().includes('fb.com') || href.toLowerCase().includes('fb.me')) {
            // console.log('display none');
            // console.log(n);
            console.log('condition facebook.com is true');
            n.parentElement.style.display = 'block';
          } else {
            n.parentElement.style.display = 'none'
          }
        }
        else if (cta == 'Whatsapp') {
          if (!href.toLowerCase().includes('whatsapp.com')) {
            // console.log('display none');
            // console.log(n);
            n.parentElement.style.display = 'none';
          }
        }
        else if (cta == 'Messenger') {
          if (!href.toLowerCase().includes('messenger.com')) {
            // console.log('display none');
            // console.log(n);

            n.parentElement.style.display = 'none';
          }
        }
      })
    }
  }
  function updateCtaNewAd(cta, n) {
    // console.log('new cta add');
    // console.log(cta, n);
    // console.log(n.querySelector('[class*="x1yc453h x1h4wwuj x1fcty0u x1lliihq"]'));
    if (cta) {


      let href = n?.querySelector('[class*="x1yc453h x1h4wwuj x1fcty0u x1lliihq"]')?.href;
      if (href) {
        href = href.replace("https://l.facebook.com/l.php?u=", '')
      }
      else {
        // console.log('display none');
        // console.log(n);
        // console.log(n.parentElement);
        if (cta != 'all') {
          n.style.display = 'none';
          return;
        }
      }
      // console.log('Return trued ');
      // console.log(cta);
      // n.parentElement.style.display = 'block';
      if (cta == 'all') {
        n.style.display = 'block';
      }
      else if (cta == 'website') {

        if (href.toLowerCase().includes('instagram.com') ||
          href.toLowerCase().includes('facebook.com') ||
          href.toLowerCase().includes('fb.com') ||
          href.toLowerCase().includes('fb.me') ||
          href.toLowerCase().includes('whatsapp.com') ||
          href.toLowerCase().includes('messenger.com')) {
          // console.log('display none');
          // console.log(n);

          n.style.display = 'none';
        } else {
          console.log(n);

          n.style.display = 'block'
        }

      } else if (cta == 'Instagram') {
        if (!href.toLowerCase().includes('instagram.com')) {
          // console.log('not instagram display none');
          // console.log('display none');
          // console.log(n);

          n.style.display = 'none';
        }

      } else if (cta == 'Facebook') {
        // console.log(href);
        // console.log(href.toLowerCase());
        if (href.toLowerCase().includes('facebook.com') || href.toLowerCase().includes('fb.com') || href.toLowerCase().includes('fb.me')) {
          // console.log('display none');
          // console.log(n);
          console.log('condition facebook.com is true');
          n.style.display = 'block';
        } else {
          n.style.display = 'none';
        }
      }
      else if (cta == 'Whatsapp') {
        if (!href.toLowerCase().includes('whatsapp.com')) {
          // console.log('not whatsapp display none');
          // console.log('display none');

          n.style.display = 'none';
        }
      }
      else if (cta == 'Messenger') {
        if (!href.toLowerCase().includes('messenger.com')) {
          // console.log('not messenger display none');
          // console.log('display none');
          // console.log(n);

          n.style.display = 'none';
        }
      }
    }
  }
  function updateActiveStatus(url, newStatus) {
    const urlObj = new URL(url);

    urlObj.searchParams.set("active_status", newStatus);

    return urlObj.toString();
  }

  function updateStartDate(url, minDate, maxDate) {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);
    if (minDate) {
      params.set("start_date[min]", minDate);
    }
    if (maxDate) {
      params.set("start_date[max]", maxDate);
    }
    urlObject.search = params.toString();

    return urlObject.toString();
  }
  function updateCountry(url, code) {
    const urlObject = new URL(url);
    const params = new URLSearchParams(urlObject.search);
    if (code) {
      params.set("country", code);
    }
    urlObject.search = params.toString();

    return urlObject.toString();
  }

  function getStartDateMinValue() {
    const urlObject = new URL(window.location.href);
    const params = new URLSearchParams(urlObject.search);
    const startDateMinValue = params.get("start_date[min]");
    // console.log(startDateMinValue);
    if (startDateMinValue) {
      return `value="${startDateMinValue}"`;
    }
  }

  function getStartDateMaxValue() {
    const urlObject = new URL(window.location.href);
    const params = new URLSearchParams(urlObject.search);

    // Get the value of start_date[min]
    if (params.get("start_date[max]")) {
      const startDateMaxValue = reduceOneDayFromDate(
        params.get("start_date[max]")
      );
      console.log(startDateMaxValue);
      if (startDateMaxValue && isDateGreaterThan2000(startDateMaxValue)) {
        return `value="${startDateMaxValue}"`;
      }
    }
  }

  function isDateGreaterThan2000(inputDate) {
    const providedDate = new Date(inputDate);
    const referenceDate = new Date("2000-01-01");
    return providedDate > referenceDate;
  }

  function reduceOneDayFromDate(inputDate) {
    const dateObject = new Date(inputDate);
    dateObject.setDate(dateObject.getDate() - 1);
    const resultDate = dateObject.toISOString().split("T")[0];
    return resultDate;
  }

  // display the message for saved ads
  function showPopup(message, error) {
    // Create the div element
    //div = document.createElement('div');
    let timeDisplay = 3000;
    if (error) {
      // Set the div's attributes
      div.style.width = "250px";
      div.style.backgroundColor = "#FFFF00";
      div.style.color = "#6F4E37"
      timeDisplay = 7000;
      div.style.display = "flex";
      div.style.padding = "5px";
    } else {
      // Set the div's attributes
      div.style.display = "block";
      div.style.width = "200px";
      div.style.backgroundColor = "#1dbf73";
    }

    div.style.borderRadius = "5px";
    div.style.zIndex = "2000";

    // Position the div in the center of the screen
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.textAlign = "center";

    //div.style.paddingTop = "50px"
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";

    div.style.transform = "translate(-50%, -50%)";
    div.innerHTML = `<span style="display: grid; place-items: center; font-family:tahoma;font-weight: bold;font-size:20px" >${message}</span>`;

    // Add the div to the document body
    document.body.appendChild(div);

    // Show the div for two seconds
    // div.style.display = 'block';
    setTimeout(() => {
      div.style.display = "none";
    }, timeDisplay);
  }

  function injectCardUI(n) {
    // console.log("injectCardUI");
    // console.log({n});

    const adHeaderDiv = document.createElement("div");
    adHeaderDiv.id = "adHeader2";

    const Guardar_Anuncio_Ganador_Btn = document.createElement("button");
    Guardar_Anuncio_Ganador_Btn.id = "Guardar_Anuncio_Ganador_Btn2";
    // Guardar_Anuncio_Ganador_Btn.setAttribute("style", "");
    Guardar_Anuncio_Ganador_Btn.innerText = "Guardar anuncio";
    Guardar_Anuncio_Ganador_Btn.addEventListener("click", async (e) => {
      const { selectedCatg } = await chrome.storage.local.get("selectedCatg");

      if (selectedCatg || false) {
        selectedMainCategory = selectedCatg;
        const data = getAdData(n, selectedCatg);
        console.log(data);
        /* --- 1. Mostrar barra de progreso --- */
        showSavingBar(n);
        sendPostRequest(data, n);
        // showPopup()
        // Pop up the div
        div.style.display = "flex";
      } else {
        console.log("No category selected", e.target.parentElement);
        let popup = adCategoryPopup(e.target);
        popup.show();
      }
    });

    const categoryIconDiv = document.createElement("div");
    categoryIconDiv.id = "adCategoryPopup2";
    const categoryPopupBtn = document.createElement("img");
    categoryPopupBtn.setAttribute(
      "src",
      chrome.runtime.getURL("./images/pluspop.svg")
    );
    categoryPopupBtn.setAttribute(
      "style",
      "width:15px; height:15px;cursor:pointer;"
    );
    categoryPopupBtn.id = "";
    
    
    /*categoryPopupBtn.addEventListener("click", (e) => {
      let popup = adCategoryPopup(e.target);
      popup.show();
    });*/
      // NEW NATIVE POPUP LOGIC for categoryPopupBtn:
      categoryPopupBtn.addEventListener("click", async (e) => {
        e.stopPropagation(); // Prevent event bubbling

        // Ensure any old Tippy popups are hidden if necessary (good practice)
        hideActivePopup(); // Your existing function to hide Tippy popups

        // ----> SET THE CURRENT AD CARD CONTEXT HERE <----
        currentAdCardForNativePopup = n; // Assign the current ad card 'n'


        const optionsBox = document.getElementById('nativeCategoryOptionsBox');
        if (!optionsBox) {
          console.error("Native category optionsBox not found!");
          return;
        }

        showNativeCategoryPopup(); // Show the new native popup

        try {
          // Call loadCategories
          await loadCategories({
            container: optionsBox,
            onSelect: nativeUpdateName, // Use the new onSelect handler
            beforeRender() {
              optionsBox.querySelectorAll(".category_name").forEach(el => el.remove());
            }
          });
        } catch (error) {
          console.error("Error loading categories into native popup:", error);
          MessagePopup("Error al cargar categorías."); // Your existing MessagePopup
          hideNativeCategoryPopup(); // Hide if loading fails
        }
      });    


    categoryIconDiv.appendChild(categoryPopupBtn);
    adHeaderDiv.appendChild(Guardar_Anuncio_Ganador_Btn);
    // adHeaderDiv.appendChild(categoryPopupBtn);
    adHeaderDiv.appendChild(categoryIconDiv);
    const downloadIcon = document.createElement("img");

    downloadIcon.src = chrome.runtime.getURL(
      "./images/download-minimalistic-svgrepo-com.svg"
    );
    downloadIcon.id = "download_btn2";
    downloadIcon.setAttribute(
      "style",
      "cursor:pointer; width:20px; height:20px;"
    );
    downloadIcon.addEventListener("click", () => {
      let links = [];
      let category = null;

      if (
        n
          .querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
          ?.querySelectorAll("img")[0]
      ) {
        n.querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
          ?.querySelectorAll("img")
          .forEach((element) => {
            links.push(element.src);
            category = "image";
          });
      } else if (
        n
          .querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
          ?.querySelectorAll("video")[0]
      ) {
        n.querySelector('[class*="x1ywc1zp x78zum5 xl56j7k x1e56ztr"]')
          ?.querySelectorAll("video")
          .forEach((element) => {
            links.push(element.src);
            category = "video";
          });
        showDownload("flex");
      }
      chrome.runtime.sendMessage({
        msg: "download",
        category: category,
        url: links,
      });
    });

    $(n).children("div:first").addClass("card-shadow2");
    $(n).children("div:first").prepend(adHeaderDiv);
    n.querySelector(
      '[class="x2lah0s x9otpla x14z9mp x1wsgfga xdwrcjd"]'
    ).prepend(downloadIcon);
  }

  function removeCardUIMain(n) {
    try {
      //console.log('remove card main');
      n.querySelector("#adHeader")?.remove();
      n.querySelector("#download_btn")?.remove();
      n.querySelector(".activeDays")?.remove();
      n.removeAttribute("style");
      // n.style.display = "block";
      n.querySelector(".totalads")?.removeAttribute("style");
      const brs = document.querySelectorAll("br");
      // for (let i = 0; i < brs.length; i++) {
      //   const element = brs[i];
      //   if (i <= brs.length - 2) {
      //     element?.remove();
      //   }
      // }
      n.querySelector("div")?.classList?.remove("card-shadow");
    } catch (e) {
      console.log("error removing main card:", e);
    }
  }
  function removeCardUI(el) {
    try {
      console.log('remmve card UI');
      el.querySelector("#adHeader2")?.remove();
      el.querySelector("#download_btn2")?.remove();
      el.querySelector("div")?.classList?.remove("card-shadow2");
    } catch (e) {
      console.log(el);
      console.log("eeror removing card:", e);
    }
  }

  function showSignInMessagePopup() {
    // Create the div element
    //div = document.createElement('div');

    // Set the div's attributes
    const div = document.createElement("div");
    div.style.width = "250px";
    div.style.height = "65px";
    div.style.backgroundColor = "#090d3f";
    div.style.borderRadius = "5px";
    div.style.zIndex = "2000";

    // Position the div in the center of the screen
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.textAlign = "center";

    //div.style.paddingTop = "50px"
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.paddingTop = "10px !important";

    div.style.transform = "translate(-50%, -50%)";
    div.innerHTML =
      '<span style="display: grid; place-items: center; font-family:tahoma;font-weight: bold;color:yellow;font-size:20px" >Por favor, inicia sesión para abrir el Panel</span>';

    // Add the div to the document body
    document.body.appendChild(div);

    // Show the div for two seconds
    div.style.display = "block";
    setTimeout(() => {
      div.remove();
    }, 2000);
  }

  function MessagePopup(message) {
    const div = document.createElement("div");
    div.style.width = "250px";
    div.style.height = "80px";
    div.style.backgroundColor = "#090d3f";
    div.style.borderRadius = "5px";
    div.style.zIndex = "2000";

    // Position the div in the center of the screen
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.textAlign = "center";

    //div.style.paddingTop = "50px"
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.paddingTop = "10px !important";

    div.style.transform = "translate(-50%, -50%)";
    div.innerHTML = `<span style="display: grid; place-items: center; font-family:tahoma;font-weight: bold;color:yellow;font-size:20px" >${message}</span>`;

    document.body.appendChild(div);

    div.style.display = "block";
    setTimeout(() => {
      div.remove();
    }, 2000);
  }


  function logInMessage(message) {
    const div = document.createElement("div");
    div.style.width = "500px";
    div.style.height = "110px";
    div.style.backgroundColor = "#090d3f";
    div.style.borderRadius = "5px";
    div.style.zIndex = "2000";

    // Position the div in the center of the screen
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.textAlign = "center";

    //div.style.paddingTop = "50px"
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.paddingTop = "10px !important";

    div.style.transform = "translate(-50%, -50%)";
    div.innerHTML = `<span style="display: grid; place-items: center; font-family:tahoma;font-weight: bold;color:yellow;font-size:20px" >${message}</span>`;

    document.body.appendChild(div);

    div.style.display = "block";
    setTimeout(() => {
      div.remove();
    }, 7000);
  }

  function showDownload(display) {
    // Create the div element
    const div = document.createElement("div");
    div.id = "showDownload";

    // Set the div's attributes

    div.style.width = "250px";
    div.style.height = "65px";
    div.style.backgroundColor = "#00001B";
    div.style.borderRadius = "5px";
    div.style.zIndex = "2000";

    // Position the div in the center of the screen
    div.style.position = "fixed";
    div.style.top = "50%";
    div.style.left = "50%";
    div.style.textAlign = "center";

    //div.style.paddingTop = "50px"


    div.style.alignItems = "center";
    div.style.justifyContent = "center";
    div.style.paddingTop = "10px !important";

    div.style.transform = "translate(-50%, -50%)";
    div.innerHTML =
      '<span style="display: grid; place-items: center; font-family:tahoma;font-weight: bold;color:white;font-size:20px" >Descargando...</span>';

    // Add the div to the document body
    document.body.appendChild(div);

    // Show the div for two seconds
    div.style.display = display;
  }
  
  
  //extrac the date from the text: "En circulación desde el ....."
  /*function extractDate(text) {
    const dateRegex = /(\d{1,2})\s+(ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic)\.\s+(\d{4})/;
    const match = text.match(dateRegex);
  
    if (match) {
      const day = parseInt(match[1]);
      const month = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"].indexOf(match[2]) + 1;
      const year = parseInt(match[3]);
      return new Date(year, month - 1, day).toISOString().split('T')[0];
    } else {
      // Return the current date if no valid date was found
      return new Date().toISOString().split('T')[0];
    }
  }*/

  // extraer la fecha cuando la biblioteca esta en ingles
  function extractDateEn(str) {
    // Use a regular expression to capture the date
    const datePattern = /([A-Za-z]{3} \d{1,2}, \d{4})/;
    const match = str.match(datePattern);
    
    // If a date string is found, convert it to a Date object
    const dateStr = match ? match[0] : null;
    return dateStr ? new Date(dateStr) : null;
  }

  // Get time for scroll down
  function getRandomNumber(min, max) {
    let randomNumb = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log("EL RANDOM NUMBER IS", randomNumb)
    return randomNumb;
  }

  window.onload = () => {
    let currentURL = new URL(window.location.href);
    let active_status = currentURL.searchParams.get("active_status");
    let q = currentURL.searchParams.get("q");
    console.log("Active Status: " + active_status);
    let maxDate = currentURL.searchParams.get("start_date[max]");
    let minDate = currentURL.searchParams.get("start_date[min]");
    console.log("Min Date: " + minDate);
    console.log("Max Date: " + maxDate);

    let checkLocation = setInterval(() => {
      let newLocation = new URL(window.location.href);
      let newQ = newLocation.searchParams.get("q");
      if (q != newQ) {
        let newURL = new URL(window.location.href);
        newURL.searchParams.set("active_status", active_status);
        newURL.searchParams.set("start_date[min]", minDate);
        newURL.searchParams.set("start_date[max]", maxDate);
        clearInterval(checkLocation);
        window.location.href = newURL.href;
      }
    }, 1000);
  };
})();






