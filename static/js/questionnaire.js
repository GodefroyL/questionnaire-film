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
    let currentDraggedElement = null;

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
            let html = `
                <div class="conteneur_nom_film_categorie">
                    <div class="conteneur_pointe nom_film">${item.film}</div>
                    <div class="conteneur_pointe categorie">${item.categorie}</div>
                </div>
            `;
            
            // Utilisation d'un switch-case pour gérer les différentes catégories
            switch (item.categorie) {
                case "Quel film ?":
                case "Qui parle ?":
                case "A qui est adressé cette phrase ?":
                case "Phrase d'avant":
                case "Phrase d'après":
                case "Question de détail":
                    html += `
                        <div class="conteneur_question">
                            <div class="question">${item.question}</div>
                            <div class="info">${item.info}</div>
                            <input type="text" name="reponse" class="reponse" placeholder="Zone de réponse">
                        </div>
                    `;
                case "Quel film ?":
                    html = html.replace('<div class="conteneur_pointe nom_film">${item.film}</div>','');

                case "Citation à trous":
                    setupInputWidthAdjustment();
                    
                case "Remettre dans l'ordre":
                    
                default:
                    break;
            }
            
            questionContainer.innerHTML = html;

        } else {
            detailResultatsButton.style.display = "block";
            validerButton.style.display = "none";
            questionContainer.innerHTML = resultatsHTML();
        }
        
    }

    // Fonction pour valider l'élément courant
    function valider() {
        // A faire plus tard
    }

    // Fonction pour ajuster la largeur des inputs (utilise event delegation) uniquement pour citation à trous
    function setupInputWidthAdjustment() {
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

    // Écouteurs d'événements pour les boutons
    validerButton.addEventListener('click', valider);

    // lancement de la fonction principale au demarrage du script
    main();
})();
