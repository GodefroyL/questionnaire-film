// Fichier javascript pour l'affichage des résultats

// Variable globale
const donneGlobales = {
    message_resultat: null,
    resultat_par_question: null,
    detail_resultat: null,
    resultats: null
};

function recup_info () {
// Récupérations des élements html
    donneGlobales.message_resultat = document.getElementById("message_resultat");
    donneGlobales.resultat_par_question = document.getElementById("resultat_par_question");
    donneGlobales.detail_resultat = document.getElementById("detail_resultat");

// Récupération des résultats
    const resultats = localStorage.getItem("resultat");
    donneGlobales.resultats = JSON.parse(resultats);
}

function affichage_resultat() {
    let nombre_question_reussie = 0;
    let nombre_question_totale = 0;
    console.log(nombre_question_totale);
    for(const id in donneGlobales.resultats) {
        nombre_question_totale++;
        const resultat = donneGlobales.resultats[id];
        console.log(resultat);
        const bouton = document.createElement('button');
        bouton.className = 'bouton_resultat';
        bouton.id = `question${id}`
        bouton.textContent = id;
        if(resultat.reussi){
            bouton.style.backgroundColor = 'green';
            nombre_question_reussie++;
        } else {bouton.style.backgroundColor = 'red';}
        bouton.addEventListener("click", () => affichage_detail(id, resultat));
        donneGlobales.resultat_par_question.appendChild(bouton)
    }
    const message_resultat = document.createElement('div');
    message_resultat.className = 'message_resultat';
    message_resultat.textContent = `Résultat : ${nombre_question_reussie}/${nombre_question_totale}`;
    donneGlobales.message_resultat.appendChild(message_resultat);
}

function affichage_detail(id, resultat) {
    donneGlobales.detail_resultat.innerHTML = '';
// Affichage de la question
    const question = document.createElement('span');
    question.textContent = 'Question : ' + resultat.question;
    donneGlobales.detail_resultat.appendChild(question);

// Affichage de la réponse de l'utilisateur
    const reponse_utilisateur = document.createElement('span');
    reponse_utilisateur.textContent = 'Votre réponse : ' + resultat.reponse;
    if(resultat.reussi){reponse_utilisateur.style.color = 'green';}
    else {
        reponse_utilisateur.style.color = 'red';
    // Affichage de la bonne réponse (uniquement si c'est faux)
        const bonne_reponse = document.createElement('span');
        bonne_reponse.textContent = 'Réponse attendue : ' + resultat.bonne_reponse;
        bonne_reponse.style.color = 'green';
        donneGlobales.detail_resultat.appendChild(bonne_reponse);}
    donneGlobales.detail_resultat.appendChild(reponse_utilisateur);
    const bouton = document.getElementById(`question${id}`);
    bouton.addEventListener('click', () => fermer_detail(id,resultat));

}

function fermer_detail(id,resultat) {
    donneGlobales.detail_resultat.innerHTML = '';
    const bouton = document.getElementById(`question${id}`);
    bouton.addEventListener("click", () => affichage_detail(id, resultat));
}

recup_info();
affichage_resultat();
