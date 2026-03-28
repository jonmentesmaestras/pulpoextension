let user_signed_in = false
let return_session = false

async function flip_user_status(signIn, user_info) {
    console.log("signIn is " + signIn + "and user_info.email is " + user_info.email + "and user_info.pass is " + user_info.pass)

    if (signIn) {
        try {
            const response = await fetch('https://pulpoia-ops.com/backend/nodeapi/pulpologin', {
            //const response = await fetch('http://localhost:3002/pulpologin', {                
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`),
                    // 'src': 'ExtensionLoginForm',
                    // 'referer': 'Popup.html'
                }
            })
            let res = {};
            try {
                const rawBody = await response.text();
                res = rawBody ? JSON.parse(rawBody) : {};
            } catch (parseError) {
                console.log("invalid login JSON", parseError);
                return { error: true, message: "Respuesta inválida del servidor" };
            }


            console.log("res token is " + res.token)

            console.log("result", res)

            // console.log("Dias que restan", res.RemainingDays)

            const hasValidToken = typeof res?.token === "string" && res.token.trim().length > 0;
            const hasApprovedPayload = res?.error === false && Number(res?.code) === 200 && hasValidToken;
            const isApprovedHttpStatus = response.status === 200 || response.status === 304;
            const isApprovedLogin = isApprovedHttpStatus && hasApprovedPayload;


            return await new Promise(resolve => {



                if (res.error) {

                    resolve(res);
                } 
                // --- NUEVO BLOQUE: DETECCIÓN DE MIGRACIÓN ---
                else if (res.migration_needed) {
                    console.log("Migración requerida para: ", user_info.email);
                    // NO guardamos sesión, solo devolvemos la info al popup para mostrar el muro
                    resolve(res); 
                } 
                // --- FIN NUEVO BLOQUE ---
                else if (isApprovedLogin) {
                    // Login Exitoso Normal
                    chrome.storage.session.set({ 
                        userStatus: true, 
                        view: "form", 
                        email: user_info.email, 
                        token: res.token,
                        Nombre: res.customerInfo?.Nombre || "", 
                        Message: res.customerInfo?.Message || "", 
                        RemainingDays: res.RemainingDays 
                    }, function () {
                        if (chrome.runtime.lastError) {
                            resolve({ error: true, message: "No se pudo guardar la sesión" });
                            return;
                        }

                        user_signed_in = true;
                        console.log('local storage is set successfully');
                        resolve(res);
                    });
                } else {
                    resolve({ error: true, message: "Respuesta de login no aprobada por la extensión" });
                }
            });
        } catch (err) {
            console.log("could not get the host " + err);
            return { error: true, message: "Error de conexión con el servidor" };
        }
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === 'login') {

        console.log("request.message que recibo" + request.message)

        flip_user_status(true, request.payload)
            .then(res => sendResponse(res))
            .catch(err => {
                console.log(err);
                sendResponse({ error: true, message: "Error inesperado durante el inicio de sesión" });
            })


        //sendResponse({message: 'success'})



        return true


    }
})

/*chrome.browserAction.onClicked.addListener(function(tab){
    let msg = {
        txt: "hello"
    }
    console.log("hicieron click")
    chrome.tabs.sendMessage(tab.id, msg)
})*/

