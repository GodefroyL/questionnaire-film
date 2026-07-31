// Encapsulation des variables globales dans une IIFE pour éviter les conflits
(function() {
    // Sélecteurs DOM stockés dans des variables pour éviter les appels répétés
    const questionContainer = document.getElementById('question');
    const validerButton = document.getElementById('valider');
    const detailResultatsButton = document.getElementById('detailResultats');
    const divDetail = document.getElementById('divDetail');

    // Variables internes
    let donnee = [];
    let index = -1;
    let resultats = {};

    // Fonction principale pour lancer le questionnaire
    function main() {
        chargementDonnees();
        affichageQuestion();
    }

    // Fonction pour charger le fichier JSON
    async function chargementDonnees() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const questionnaire = urlParams.get('questionnaire');
            const niveau = urlParams.get('niveau') ?? '';
            const questions = await fetch(`../static/json/${questionnaire}_${niveau}.json`);
            donnee = await questions.json();
            console.log(`Chargement du questionnaire: ${questionnaire}, niveau: ${niveau} avec ${donnee.length} questions.`);
        } catch (error) {
            console.error("Erreur lors du chargement du fichier JSON :", error);
        }
    }

    // Fonction pour afficher les données
    function affichageQuestion() {
        index++;
        if (index < donnee.length) {
            const item = donnee[index];
            let html = '';
            
            // Utilisation d'un switch-case pour gérer les différentes catégories
            switch (item.categorie) {
                case "Complétez":
                    html = completezHTML(item);
                    break;
                case "Qui parle ?":
                case "A qui est adressé cette phrase ?":
                case "Quel film ?":
                    html = `
                        <h2>${item.categorie}</h2>
                        <p>${item.intitule}</p>
                        <input type="text" name="reponse">`;
                    break;
                default:
                    html = `
                        <h2>${item.categorie}</h2>
                        <p>${item.intitule}</p>
                        <input type="text" name="reponse">`;
                    break;
            }
            
            questionContainer.innerHTML = html;
            
            if (!item.programme) {
                questionContainer.innerHTML += `<p><em>Cette question porte sur un film hors programme.</em></p>`;
            }
        } else {
            detailResultatsButton.style.display = "block";
            validerButton.style.display = "none";
            questionContainer.innerHTML = resultatsHTML();
        }

        // Appliquer l'adaptation de largeur à tous les inputs (event delegation)
        setupInputWidthAdjustment();
    }

    // Fonction pour ajuster la largeur des inputs (utilise event delegation)
    function setupInputWidthAdjustment() {
        // Supprimer les anciens écouteurs si nécessaire (non nécessaire avec event delegation)
        questionContainer.addEventListener('input', function(e) {
            if (e.target.matches('input[type="text"][name="reponse"]')) {
                const input = e.target;
                const tempSpan = document.createElement('span');
                tempSpan.style.visibility = 'hidden';
                tempSpan.style.whiteSpace = 'pre';
                tempSpan.style.fontFamily = window.getComputedStyle(input).fontFamily;
                tempSpan.style.fontSize = window.getComputedStyle(input).fontSize;
                tempSpan.style.padding = window.getComputedStyle(input).padding;
                tempSpan.textContent = input.value || input.placeholder;

                document.body.appendChild(tempSpan);
                const newWidth = Math.min(
                    Math.max(tempSpan.offsetWidth + 20, 50),
                    300
                );
                document.body.removeChild(tempSpan);

                input.style.width = newWidth + 'px';
            }
        });

        // Déclencher l'ajustement pour les inputs existants
        document.querySelectorAll('input[type="text"][name="reponse"]').forEach(input => {
            input.dispatchEvent(new Event('input'));
        });
    }

    // Fonction pour valider l'élément courant
    function valider() {
        if (index < donnee.length) {
            const item = donnee[index];
            const inputs = document.querySelectorAll('input[type="text"][name="reponse"]');
            let reponse = "";
            inputs.forEach(input => {
                let valeur = input.value.trim();
                if (valeur) {
                    valeur = valeur.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
                    valeur = valeur.replace(/\s{2,}/g, ' ');
                    valeur = valeur.toLowerCase();
                    reponse += " " + valeur;
                }
            });
            reponse = reponse.slice(1);
            const isCorrect = item.reponses.includes(reponse);
            resultats[index] = isCorrect;

            // Appliquer l'animation en fonction du résultat
            if (isCorrect) {
                questionContainer.classList.add('success');
            } else {
                questionContainer.classList.add('error');
            }

            // Retirer l'animation après son exécution
            setTimeout(() => {
                questionContainer.classList.remove('success', 'error');
                affichageQuestion();
            }, 300);
        }
    }

    function completezHTML(item) {
        let html = `
        <h2>${item.categorie}</h2>
        (pour le nombre de mots : d'ici = 1 mots)<p>
        `;
        for (const element of item.intitule) {
            html += `${element} `;
            html += `<input type="text" name="reponse"> `;
        }
        html = html.slice(0, -33);
        html += `</p>`;
        return html;
    }

    function resultatsHTML() {
        let html = `<h2>Résultats</h2>`;
        const nombreBonnesReponses = Object.values(resultats).filter(resultat => resultat).length;
        html += `<p>Vous avez obtenu ${nombreBonnesReponses} bonnes réponses sur ${Object.keys(resultats).length} questions.</p>`;
        return html;
    }

    function detailResultatsHTML() {
        divDetail.style.display = "block";
        detailResultatsButton.style.display = "none";
        let html = `<h2>Résultats</h2><ul>`;
        for (const [index, resultat] of Object.entries(resultats)) {
            const item = donnee[index];
            html += `<li>Question ${index}: ${item.intitule} ${resultat ? 'Correct' : 'Incorrect'}</li>`;
        }
        html += `</ul>`;
        divDetail.innerHTML = html;
    }

    // Écouteurs d'événements pour les boutons
    validerButton.addEventListener('click', valider);
    detailResultatsButton.addEventListener('click', detailResultatsHTML);

    // Charger les données au démarrage
    chargementDonnees();
})();
