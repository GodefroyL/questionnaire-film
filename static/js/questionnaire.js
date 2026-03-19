// Variable pour stocker les données et l'index courant
let donnee = [];
let index = -1;
let resultats = {};

// Fonction pour charger le fichier JSON
async function chargementDonnees() {
    try {
        const response = await fetch('../static/json/questions_test.json');
        donnee = await response.json();
        affichageDonnee();
    } catch (error) {
        console.error("Erreur lors du chargement du fichier JSON :", error);
    }
}

// Fonction pour afficher les données
function affichageDonnee() {
    index++;
    const container = document.getElementById('question');
    if (index < donnee.length) {
        const item = donnee[index];
        if (item.categorie == "Complétez") {
            container.innerHTML = completezHTML(item);
        } else {
            container.innerHTML = `
                <h2>${item.categorie}</h2>
                <p>${item.intitule}</p>
                <input type="text" name="reponse">`;
        }
        if (!item.programme) {
            container.innerHTML += `<p><em>Cette question porte sur un film hors programme.</em></p>`;
        }
    } else {
        document.getElementById('detailResultats').style.display = "block";
        document.getElementById('valider').style.display = "none";
        container.innerHTML = resultatsHTML();
    }

    // Appliquer l'adaptation de largeur à tous les inputs
    document.querySelectorAll('input[type="text"]').forEach(input => {
        input.addEventListener('input', function() {
            const tempSpan = document.createElement('span');
            tempSpan.style.visibility = 'hidden';
            tempSpan.style.whiteSpace = 'pre';
            tempSpan.style.fontFamily = this.style.fontFamily;
            tempSpan.style.fontSize = this.style.fontSize;
            tempSpan.style.padding = this.style.padding;
            tempSpan.textContent = this.value || this.placeholder;

            document.body.appendChild(tempSpan);
            const newWidth = Math.min(
                Math.max(tempSpan.offsetWidth + 20, 50),
                300
            );
            document.body.removeChild(tempSpan);

            this.style.width = newWidth + 'px';
        });
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
        resultats[index] = item.reponses.includes(reponse);
        affichageDonnee();
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
    const container = document.getElementById('divDetail');
    document.getElementById('divDetail').style.display = "block";
    document.getElementById('detailResultats').style.display = "none";
    let html = `<h2>Résultats</h2><ul>`;
    for (const [index, resultat] of Object.entries(resultats)) {
        html += `<li>Question ${index}: ${resultat ? 'Correct' : 'Incorrect'}</li>`;
    }
    html += `</ul>`;
    container.innerHTML = html;
}

// Écouteurs d'événements pour les boutons
document.getElementById('valider').addEventListener('click', valider);
document.getElementById('detailResultats').addEventListener('click', detailResultatsHTML);

// Charger les données au démarrage
chargementDonnees();
