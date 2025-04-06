if(document.cookie.split('; ').find(row => row.startsWith('Information=')) !== undefined ){
            const modal = document.getElementById("myModal");
            const span = document.getElementsByClassName("close")[0];
            const message = document.getElementsByClassName("message")[0]
            message.innerText = "Mauvais choix.Réesayer"
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
            await fetch('/api')
        }