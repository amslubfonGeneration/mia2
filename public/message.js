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
/*const studentLoginButton = document.getElementById('student-login-button');
            const sessionConsentModal = document.getElementById('session-consent-modal');
            
const acceptSessionButton = document.getElementById('accept-session');
const declineSessionButton = document.getElementById('decline-session');

            // Fonction pour vérifier si le cookie de consentement existe
            function hasSessionConsent() {
                return document.cookie.split('; ').find(row => row.startsWith('sessionConsent=')) !== undefined;
            }

            // Si le cookie de consentement existe, rediriger directement
            if (hasSessionConsent()) {
                studentLoginButton.addEventListener('click', () => {
                sessionConsentModal.style.display = 'none'; // Afficher la boîte de dialogue
                });
            } else {
                    // Sinon, afficher la boîte de dialogue
                    studentLoginButton.addEventListener('click', () => {
                    sessionConsentModal.style.display = 'block'; // Afficher la boîte de dialogue
                });
            }
*/

        };

            /*acceptSessionButton.addEventListener('click', () => {
                // Créer le cookie de consentement
                document.cookie = "sessionConsent=true; max-age=31536000; path=/"; // Valide pendant 1 an
                // Envoyer une requête au serveur pour créer la session
                window.location.href = '/login/student'; // Rediriger vers la route de connexion
                sessionConsentModal.style.display = 'none'; // Cacher la boîte de dialogue
            });

            declineSessionButton.addEventListener('click', () => {
                // Gérer le refus de la session (afficher un message, rediriger, etc.)
                alert('Vous avez refusé la création de session. Certaines fonctionnalités peuvent être limitées.');
                sessionConsentModal.style.display = 'none'; // Cacher la boîte de dialogue
            })*/
 