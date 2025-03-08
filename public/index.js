async function connexion() {
    const reponse = await fetch('/api/users')
    const data = await reponse.json()
    var mes = undefined
    if(data.isUser){
        //var modal = document.getElementById("con");
        mes = 'Connexion réussit'
        var mat = document.getElementById("mat");
        mat.innerText = `(${data.isUserId}) Connecté.`
        mat.style.color = 'chartreuse'
    }
    if(data.inscription !== undefined || data.reinit !== undefined || data.isUser){
        if(document.cookie.split('; ').find(row => row.startsWith('boiteDeDialogue=')) === undefined ){
            const modal = document.getElementById("myModal");
            const span = document.getElementsByClassName("close")[0];
            const message = document.getElementsByClassName("message")[0]
            message.innerText = mes || 'Succes !'
            modal.style.display = "block";
                // Ferme la boîte d'alerte au bout de 5 secondes
            setTimeout(function() {
                modal.style.display = "none";
            }, 5000); // 5000 ms = 5 secondes

            // Ferme la boîte d'alerte lorsque l'utilisateur clique sur le "X"
            span.onclick = function() {
                modal.style.display = "none";
            }

            // Ferme la boîte d'alerte lorsque l'utilisateur clique en dehors de la boîte
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            document.cookie = "boiteDeDialogue=true; max-age=31536000; path=/"
        }
        }else{
            const modal = document.getElementById("myModal")
            modal.style.display = 'none'
        }

if(document.cookie.split('; ').find(row => row.startsWith('consultation=')) !== undefined ){
            const modal = document.getElementById("myModal");
            const span = document.getElementsByClassName("close")[0];
            const message = document.getElementsByClassName("message")[0]
            message.innerText = 'Connecter vous d\'abord.'
            modal.style.display = "block";

            setTimeout(function() {
                modal.style.display = "none";
            }, 5000); // 5000 ms = 5 secondes
            

            // Ferme la boîte d'alerte lorsque l'utilisateur clique sur le "X"
            span.onclick = function() {
                modal.style.display = "none";
            }

            // Ferme la boîte d'alerte lorsque l'utilisateur clique en dehors de la boîte
            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = "none";
                }
            }
            await fetch('/api')

}  
}
connexion()

// Sélectionner l'élément contenant le texte
const welcomeText = document.querySelector('.text-container h1');

// Définir les couleurs
const colors = ['green', 'yellow', 'red'];
let currentColorIndex = 0;

// Fonction pour changer la couleur
function changeColor() {
    welcomeText.style.color = colors[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % colors.length; // Passer à la couleur suivante
}

// Changer la couleur toutes les 1 seconde (1000 millisecondes)
setInterval(changeColor, 1000);

window.addEventListener('load', function() {
            // Ajoute la classe 'loaded' pour faire apparaître le contenu
            document.body.classList.add('loaded');
            // Affiche un message d'alerte
})

