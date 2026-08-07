// Encapsulation des variables globales dans une IIFE pour éviter les conflits
(function() {
    // Sélecteurs DOM stockés dans des variables pour éviter les appels répétés
    const ConteneurQuestion = document.getElementById('question');
    const conteneurNomFilmCategorie = document.getElementById('nom_film_categorie');
    const boutonValider = document.getElementById('valider');

    // Variables internes
    let donnee = [];
    let index = -1;
    let resultats = {};
    let deuxieme_chance = false;

    // Fonction principale pour lancer le questionnaire
    async function main() {
        await chargementDonnees();
        console.log("Données chargées :", donnee);
        await affichageQuestion();
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
        console.log("Index actuel :", index, "nombre de questions :", donnee.length);
        if (index < donnee.length) {
            console.log("Affichage de la question :", donnee[index]);
            let nom_film_categorie = '';
            const item = donnee[index];
            if (item.categorie == 'Quel film ?') {
                nom_film_categorie = `
                <div class="conteneur_pointe categorie">${item.categorie}</div>
                `;
            }
            else {
                nom_film_categorie = `
                    <div class="conteneur_pointe nom_film">${item.film}</div>
                    <div class="conteneur_pointe categorie">${item.categorie}</div>
                `;
            }
            conteneurNomFilmCategorie.innerHTML = nom_film_categorie;
            
            // Utilisation d'un switch-case pour gérer les différentes catégories
            let question = '';
            if (deuxieme_chance) {
                question += `
                    <div class="info">Deuxième tentative</div>
                `;
            }
            switch (item.categorie) {
                case "Quel film ?":
                case "Qui parle ?":
                case "A qui est adressé cette phrase ?":
                case "Phrase d'avant":
                case "Phrase d'après":
                case "Question de détail":
                    console.log("Affichage de la question :", item.question, item.categorie);
                    question += `
                        <div class="question">${item.question}</div>
                        <div class="info">${item.info}</div>
                        <input type="text" name="reponse" class="reponse" placeholder="Zone de réponse">
                    `;
                    break;

                    case "Citation à trous":
                    question += `
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
            
            ConteneurQuestion.innerHTML = question;
        }
        else {
            console.log("Fin du questionnaire. Résultats :", resultats);
            affichageResultats();
        }
    }

    // Fonction pour valider l'élément courant
    function valider() {
        if (index < donnee.length) {
            const item = donnee[index];
            const reponse_entree = document.querySelectorAll('input[name="reponse"]');
            let reponse_utilisateur = "";
            let input_utilisateur = "";
            reponse_entree.forEach(input => {
                input_utilisateur = input.value.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g," ").replace(/\s{2,}/g," ");
                reponse_utilisateur += " " + input_utilisateur;
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
                    if (reponses_valides.some(reponse => reponse == reponse_utilisateur)) {
                        resultats[item.id] = {
                            reussi: true,
                            affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                        };
                    }
                    else {
                        resultats[item.id] = {
                        reussi: false,
                        affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                        };
                    }
                    break;

                case "Question de détail":
                    resultats[item.id] = {
                        reussi: false,
                        affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                    };
                    for (let reponse of reponses_valides) {
                        if (reponse_utilisateur.toLowerCase().includes(reponse)) {
                            resultats[item.id] = {
                                reussi: true,
                                affichage_resultat: `Question: ${item.question} - Réponse: ${reponse_utilisateur}`
                            };
                        }
                        }
                    break;                                    
            }

            if (resultats[item.id].reussi){
                ConteneurQuestion.classList.add('reussite');
                
            }
            else {
                ConteneurQuestion.classList.add('echec');
                if (!deuxieme_chance) {
                    index--;
                    deuxieme_chance = true;
                    affichageQuestion();
                }
                else {
                    deuxieme_chance = false;
                }
            }
            setTimeout(() => {
                ConteneurQuestion.classList.remove('reussite', 'echec');
                affichageQuestion();
            }, 500);
        }
    }

    function affichageResultats() {
        ConteneurQuestion.innerHTML = `
            <div class="conteneur_resultats">
                <h2>Résultats</h2>
                <ul>
                    ${Object.entries(resultats).map(([id, resultat]) => `
                        <li class="${resultat.reussi ? 'reussite' : 'echec'}">
                            ${resultat.affichage_resultat}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Fonction pour ajuster la largeur des inputs pour les citations à trous
    function setupInputWidthAdjustment() {
        ConteneurQuestion.addEventListener('input', function(e) {
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
    boutonValider.addEventListener('click', valider);
    boutonValider.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            valider();
        }
    });

    // lancement de la fonction principale au demarrage du script
    main();
})();
