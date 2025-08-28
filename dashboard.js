window.onload = () => {
    console.log('loaded');
    document.querySelectorAll('button')[5].addEventListener('click', () => {
        console.log('clicked ');
        // alert('clickced')

        chrome.storage.sync.set({ loggedIn: false })
    })
}