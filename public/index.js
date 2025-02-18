
async function connexion() {
    const reponse = await fetch('/api/users')
    const data = await reponse.json()
    if(data.isUser){
        //var modal = document.getElementById("con");
        var mat = document.getElementById("mat");
        mat.innerText = `(${data.isUserId}) Connecté.`
        mat.style.color = 'chartreuse'
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

