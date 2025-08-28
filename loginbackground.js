let user_signed_in = false
let return_session = false

async function flip_user_status(signIn, user_info) {
    console.log("signIn is " + signIn + "and user_info.email is " + user_info.email + "and user_info.pass is " + user_info.pass)

    if (signIn) {
        try {
            const response = await fetch('https://nodeapi.tueducaciondigital.site/login', {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`),
                    // 'src': 'ExtensionLoginForm',
                    // 'referer': 'Popup.html'
                }
            })
            const res = await response.json();


            console.log("res token is " + res.token)

            console.log("result", res)

            // console.log("Dias que restan", res.RemainingDays)


            return await new Promise(resolve => {



                if (res.error) {

                    resolve(res);

                } else {
                    console.log(user_info);

                    chrome.storage.session.set({ 
                        userStatus: true, 
                        view: "form", email: user_info.email, token: res.token,
                        Nombre: res.customerInfo.Nombre, Message:res.customerInfo.Message, 
                        RemainingDays: res.RemainingDays }, function () {
                        // Check if there was an error
                        if (chrome.runtime.lastError) resolve('fail')

                        user_signed_in = true
                        console.log('local storage is set successfully');
                        console.log(res);
                        resolve(res)


                    })

                }

            })
        } catch (err) {
            return console.log("could not get the host " + err)
        }
    }
}


chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    if (request.message === 'login') {

        console.log("request.message que recibo" + request.message)

        flip_user_status(true, request.payload)
            .then(res => sendResponse(res))
            .catch(err => console.log(err))


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

