// Encapsulation des variables globales dans une IIFE pour éviter les conflits
(function() {
    // Sélecteurs DOM stockés dans des variables pour éviter les appels répétés
    const questionContainer = document.getElementById('question');
    const nomFilmCategorieContainer = document.getElementById('nom_film_categorie');
    const validerButton = document.getElementById('valider');

    // Variables internes
    let donnee = [];
    let index = -1;
    let resultats = {};

    // Fonction principale pour lancer le questionnaire
    async function main() {
        await chargementDonnees();
        console.log("Données chargées :", donnee);
        await affichageQuestion();
        await affichageResultats();
    }

    // Fonction pour charger le fichier JSON
    async function chargementDonnees() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const questionnaire = urlParams.get('questionnaire');
            const niveau = urlParams.get('niveau') ?? '';
            const questions = await fetch(`../static/json/${questionnaire}_${niveau}.json`);
            donnee = await questions.json();
        } catch (error) {
            console.error("Erreur lors du chargement du fichier JSON :", error);
        }
    }

    // Fonction pour afficher les données
    function affichageQuestion() {
        index++;
        if (index < donnee.length) {
            const item = donnee[index];
            if (item.categorie == 'Quel film ?') {
                let nom_film_categorie = `
                <div class="conteneur_pointe categorie">${item.categorie}</div>
                `;
            }
            else {
                let nom_film_categorie = `
                    <div class="conteneur_pointe nom_film">${item.film}</div>
                    <div class="conteneur_pointe categorie">${item.categorie}</div>
                `;
            }
            nomFilmCategorieContainer.innerHTML = nom_film_categorie;
            
            // Utilisation d'un switch-case pour gérer les différentes catégories
            let question = '';
            switch (item.categorie) {
                case "Quel film ?":
                case "Qui parle ?":
                case "A qui est adressé cette phrase ?":
                case "Phrase d'avant":
                case "Phrase d'après":
                case "Question de détail":
                    question += `
                        <div class="conteneur_question">
                            <div class="question">${item.question}</div>
                            <div class="info">${item.info}</div>
                            <input type="text" name="reponse" class="reponse" placeholder="Zone de réponse">
                        </div>
                    `;
                    break;

                    case "Citation à trous":
                    question += `
                        <div class="conteneur_question">
                            <div class="info">${item.info}</div>
                            <div class="question">
                    `;
                    for (let i = 0; i < item.question.length; i++) {
                        question += `
                            ${item.question[i]}
                            <input type="text" name="reponse" class="reponse" placeholder="Zone de réponse">
                        `;
                    }
                    question = question.slice(0, -80); // Supprime le dernier input ajouté
                    question += `
                        </div>
                        </div>
                    `;
                    setupInputWidthAdjustment();
                    break;
                    
                case "Remettre dans l'ordre":
                    question += `
                        Pas encore implémenté
                    `;
                    break;
                    
                default:
                    break;
            }
            
            questionContainer.innerHTML = question;
        }
        else {
            break;
        }
        
    }

    // Fonction pour valider l'élément courant
    function valider() {
        if (index < donnee.length) {
            const item = donnee[index];
            const reponse_entree = document.querySelectorAll('input[name="reponse"]');
            const reponse_utilisateur = "";
            reponse_entree.forEach(input => {
                input.value = input.value.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ");
                reponse_utilisateur += " " + input.value;
            });
            reponse_utilisateur = reponse_utilisateur.slice(1);
            let reponses_valides = item.reponses;

            switch (item.categorie) {
                case "Quel film ?":
                case "Qui parle ?":
                case "A qui est adressé cette phrase ?":
                case "Phrase d'avant":
                case "Phrase d'après":
                case "Citation à trous":
                case "Remettre dans l'ordre":
                    if (reponses_valides.some(reponse => reponse === reponse_utilisateur)) {
                        resultats[item.id] = {
                            reussi: true,
                            affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                        };
                    }
                    else {
                        resulats[item.id] = {
                        reussi: false,
                        affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                        };
                    }
                    break;

                case "Question de détail":
                    for (let reponse of reponses_valides) {
                        if (reponse_utilisateur.toLowerCase().includes(reponse)) {
                            resultats[item.id] = {
                                reussi: true,
                                affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                            };
                            break;
                        }
                        else {
                            resulats[item.id] = {
                            reussi: false,
                            affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                            };
                        }
                    }
                    break;
                                    
            }
            if (resultats[item.id].reussi){
                questionContainer.classList.add('reussite');
            }
            else {
                questionContainer.classList.add('echec');
            }
            affichageQuestion();
        }
    }

    // Fonction pour ajuster la largeur des inputs pour les citations à trous
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
