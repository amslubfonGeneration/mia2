const acceptSessionButton = document.getElementById('accept-session');
const declineSessionButton = document.getElementById('decline-session');
const sessionConsentModal = document.getElementById('session-consent-modall');

if(document.cookie.split('; ').find(row => row.startsWith('sessionConsent=')) === undefined){
    sessionConsentModal.style.display = 'block'
    declineSessionButton.addEventListener('click', () => {
        document.cookie = "sessionDeConsent=true; max-age=31536000; path=/"
        sessionConsentModal.style.display = 'none'; // Afficher la boîte de dialogue
    })
    acceptSessionButton.addEventListener('click', () => {
        document.cookie = "sessionConsent=true; max-age=31536000; path=/"
        sessionConsentModal.style.display = 'none'
        //window.location.href = '/createcookies';
    })
}
if(document.cookie.split('; ').find(row => row.startsWith('sessionDeConsent=')) !== undefined){
    sessionConsentModal.style.display = 'none'
}

        var note = document.getElementsByClassName("note")[0].innerHTML
        var color = document.getElementsByClassName("info")
        if(parseFloat(note) < 10){
            color[1].style.backgroundColor = 'red'
        }else{
            color[1].style.backgroundColor = 'yellow'
        }
        if(parseFloat(note) > 12){
            color[1].style.backgroundColor = 'lawngreen'
        }
    