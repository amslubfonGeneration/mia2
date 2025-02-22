window.onload = function() {
            var modal = document.getElementById("myModal");
            var span = document.getElementsByClassName("close")[0];

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
        };

            