let user_signed_in = false
let return_session = false

async function flip_user_status(signIn, user_info) {
    console.log("signIn is " + signIn + "and user_info.email is " + user_info.email + "and user_info.pass is " + user_info.pass)

    if (signIn) {
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(`${user_info.email}:${user_info.pass}`)
                }
            })
            const res = await response.json();


            console.log("res token is " + res.token)


            return await new Promise(resolve => {



                if (res.error) {

                    resolve('fail')

                }


                chrome.storage.session.set({ userStatus: true, view: "form", token: res.token }, function () {
                    // Check if there was an error
                    if (chrome.runtime.lastError) resolve('fail')

                    user_signed_in = true
                    resolve('success')


                })



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

