// =============================================================================
// questionnaire.js
// Dépend de validation.js (fonctions normaliser et estCorrect), à charger avant.
// =============================================================================

// Encapsulation des variables globales dans une IIFE pour éviter les conflits
(function() {
    // Sélecteurs DOM stockés dans des variables pour éviter les appels répétés
    const conteneurQuestion = document.getElementById('question');
    const conteneurNomFilmCategorie = document.getElementById('nom_film_categorie');
    const boutonValider = document.getElementById('valider');

    // Variables internes
    let donnee = [];
    let index = 0;
    let resultats = {};
    let deuxieme_chance = false;
    let verrou = false; // Verrou anti double validation : pendant les 500 ms d'animation, un second clic ou un second appui sur Entrée faisait index++ deux fois et sautait une question.

    // Fonction principale pour lancer le questionnaire
    async function main() {
        await chargementDonnees();
        await affichageTitre();
        await affichageQuestion(index);
    }

    async function affichageTitre() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const questionnaire = urlParams.get('questionnaire');
            const titreElement = document.querySelector('.titre');
            const titre = questionnaire.replace(/_/g, ' ')           // /_/g car replace('_', ' ') ne remplacerait que le premier "_"
            titreElement.textContent = `Questionnaire : ${titre}`;
            resultats["questionnaire"] = titre
        } catch (error) {
            console.error("Erreur lors de l'affichage du titre :", error);
        }
    }

    // Fonction pour charger le fichier JSON
    async function chargementDonnees() {
        try {
        // Récupération des informations dans l'url de la page
            const urlParams = new URLSearchParams(window.location.search);
            const questionnaire = urlParams.get('questionnaire');
            const niveau = urlParams.get('niveau') ?? '';
        // Chargement du fichier json
            const questions = await fetch(`../static/json/${questionnaire}_${niveau}.json`);
            donnee = await questions.json();
        } catch (error) {
            console.error("Erreur lors du chargement du fichier JSON :", error);
        }
    }

    // Fonction pour afficher les données
    function affichageQuestion(index) {
    // Récupération de la question courante
        const item = donnee[index];

        // Si le JSON n'a pas pu être chargé, item est undefined on sort proprement.
        if (!item) {
            conteneurQuestion.innerHTML = `<div class="info">Impossible de charger le questionnaire.</div>`;
            return;
        }

        // Affichage du nom du film et de la catégorie
        let nom_film_categorie = '';
        if (item.categorie == 'Quel film ?') {
            nom_film_categorie = `
            <div class="conteneur_pointe categorie" style="margin-top: 40px">${item.categorie}</div>
            `;
        }
        else {
            nom_film_categorie += `<div class="conteneur_pointe nom_film">${item.film}</div>`;
            nom_film_categorie += `<div class="conteneur_pointe categorie">${item.categorie}</div>`;
        }
        conteneurNomFilmCategorie.innerHTML = nom_film_categorie;

    // Remplissage de la zone de question selon la catégorie
        let question = '';
        if (deuxieme_chance) {
            question += `
                <div class="info">
                Deuxième tentative<br>Réponse de la première tentative : ${resultats[item.id].reponse}
                </div>
            `;
        }
        switch (item.categorie) {
            case "Quel film ?":
            case "Qui parle ?":
            case "A qui est adressée cette phrase ?":
            case "Phrase d'après":
            case "Question de détail":
                question += `
                    <div class="question">${item.question}</div>
                    <div class="info">${item.info}</div>
                    <input type="text" name="reponse" class="reponse" placeholder="Zone de réponse">
                `;
                break;

            case "Citation à trous":
                question += `
                    <div class="info">${item.info}<br>"qu'il" ou "n'est" = 2 mots</div>
                    <div class="question">
                    ${item.question[0]}
                `;
                for (let i = 1; i < item.question.length; i++) {
                    question += `
                        <input type="text" name="reponse" class="reponse" placeholder="Zone de réponse">
                        ${item.question[i]}
                    `;
                }
                question += `
                    </div>
                `;
                break;

            case "Remettre dans l'ordre":
                question += `
                    Pas encore implémenté
                `;
                break;
            default:
                break;
        }
        conteneurQuestion.innerHTML = question;

        // Place le curseur dans le premier champ de saisie : on peut répondre directement au clavier, sans cliquer, et la touche Entrée (voir plus bas) enchaîne ensuite les champs.
        const premierChamp = conteneurQuestion.querySelector('input[name="reponse"]');
        if (premierChamp) premierChamp.focus();
    }

    // Fonction pour valider l'élément courant toute la partie "normalisation + comparaison" (environ 60 lignes, avec deux blocs quasi identiques pour "Question de détail" et le reste) est remplacée par des appels à normaliser() et estCorrect() de validation.js.
    function valider() {
        // Ignore les validations pendant l'animation entre deux questions
        if (verrou) return;

        const item = donnee[index];

        // On récupère les valeurs brutes des champs ; la normalisation est faite dans estCorrect().
        const saisies = [...document.querySelectorAll('input[name="reponse"]')].map(input => input.value);

        // Saisie entièrement vide : on ne valide pas, pour ne pas consommer une tentative par erreur.
        if (!saisies.some(valeur => valeur.trim() !== '')) return;

        verrou = true;

        // Vérification déléguée à validation.js.
        // Passez { tolerant: true } en 3e argument pour accepter de petites fautes de frappe (par exemple pour la catégorie "Phrase d'après").
        const reussi = estCorrect(item, saisies, { tolerant: true });

        const bonne_reponse = item.reponse_affichée || item.reponses[0] // Récupération de la réponse à afficher

        resultats[item.id] = {
            reussi: reussi,
            categorie: item.categorie,
            question: item.question,
            reponse: normaliser(saisies.join(" ")),
            bonne_reponse: bonne_reponse
        };

    // Animation de réussite ou d'échec
        if (resultats[item.id].reussi){
            conteneurQuestion.classList.add('reussite');
        // On reinitialise la variable deuxième chance pour la question suivante
            deuxieme_chance = false
        } else {
            conteneurQuestion.classList.add('echec');
        // Inversion du booléen : si la deuxième chance n'est pas faite (false) on elle est à faire (true), si elle est faite, elle est a réinitialiser pour la question d'après (false)
            deuxieme_chance = !deuxieme_chance
        }

    // Lancement de la suite du questionnaire
        setTimeout(() => {
            conteneurQuestion.classList.remove('reussite', 'echec');
            if (!deuxieme_chance) {index++;}
            if (index < donnee.length){affichageQuestion(index);}
            else {affichageResultats(resultats)}
            // [AJOUT] Déverrouille une fois la question suivante affichée
            verrou = false;
        }, 500);
    }

    function affichageResultats(resultats) {
        // Stocker dans localStorage (persiste après fermeture du navigateur)
        localStorage.setItem("resultat", JSON.stringify(resultats));

        // Rediriger vers la page résultat
        window.location.href = "resultat.html";
    }

    // Écouteurs d'événements
    boutonValider.addEventListener('click', valider);

    // Touche Entrée dans une zone de saisie :
    //  - si ce n'est pas le dernier champ, on passe au champ suivant ;
    //  - si c'est le dernier champ (ou le seul), on valide.
    // L'écouteur est posé UNE SEULE FOIS sur le conteneur (délégation d'événements) : le contenu du conteneur est recréé à chaque question via innerHTML, donc un écouteur posé sur les champs serait perdu.
    conteneurQuestion.addEventListener('keydown', function(e) {
        // On ne réagit qu'à Entrée, dans un champ de réponse
        if (e.key !== 'Enter') return;
        if (!e.target.matches('input[name="reponse"]')) return;
        // Ignore l'Entrée qui sert à valider un mot dans un clavier de composition (saisie en cours sur certains claviers mobiles)
        if (e.isComposing) return;

        e.preventDefault(); // empêche tout comportement par défaut (envoi de formulaire...)

        const champs = [...conteneurQuestion.querySelectorAll('input[name="reponse"]')];
        const position = champs.indexOf(e.target);

        if (position < champs.length - 1) {
            champs[position + 1].focus(); // champ suivant
        } else {
            valider();                    // dernier champ : on valide
        }
    });

    // lancement de la fonction principale au demarrage du script
    main();
})();
