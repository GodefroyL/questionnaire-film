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
    donneGlobales.resultats = localStorage.getItem("resultat")    
}

function affichage_resultat() {
    let nombre_question_reussie = 0;
    const nombre_question_totale = donneGlobales.resultats.length();
    for(let id in donneGlobales.resultats.keys()) {
        resultat = donneGlobales.resultats[id];
        const bouton = document.createElement('button');
        bouton.className = 'bouton_resultat';
        bouton.textContent = id;
        if(resultat[reussi]){
            bouton.style.backgroundColor = 'green';
            nombre_question_reussie++;
        } else {bouton.style.backgroundColor = 'red';}
        bouton.addEventListener("click", affichage_detail(resultat));
        donneGlobales.resultat_par_question.appendChild(bouton)
    }
    const message_resultat = document.createElement('div');
    message_resultat.className = 'message_resultat';
    message_resultat.textContent = `Résultat : ${nombre_question_reussie}/${nombre_question_totale}`;
    donneGlobales.message_resultat.appendChild(message_resultat);
}

function detail_resultat(resultat) {
    const question = document.createElement('span');
    question.textContent = 'Question : ' + resultat.question;
    donneGlobales.detail_resultat.appendChild(question);
    const reponse_utilisateur = document.createElement('span');
    reponse_utilisateur.textContent = 'Votre réponse : ' + resultat.reponse;
    if(resultat[reussi]){reponse_utilisateur.style.color = 'green';} else {reponse_utilisateur.style.backgroundColor = 'red';}
    donneGlobales.detail_resultat.appendChild(reponse_utilisateur);
    const bonne_reponse = document.createElement('span');
    bonne_reponse.textContent = 'Réponse attendue : ' + resultat.bonne_reponse;
    bonne_reponse.style.backgroundColor = 'green';
    donneGlobales.detail_resultat.appendChild(bonne_reponse);
}

recup_info();
affichage_resultat();
console.log(document.body)