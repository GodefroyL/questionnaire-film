// Variable pour stocker les données et l'index courant
let donnee = [];
let index = 1;
let resultats = {};

// Fonction pour charger le fichier JSON
async function chargementDonnees() {
  try {
    const response = await fetch('../static/json/questions.json');
    donnee = await response.json();
    affichageDonnee();
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}

// Fonction pour afficher les données
function affichageDonnee() {
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
    document.getElementsByName("detailResultats").style.display = "block";
    document.getElementById("valider").style.display = "none"
    container.innerHTML = resultatsHTML();
  }
}

// Fonction pour valider l'élément courant
function valider() {
  if (index < donnee.length) {
    const item = donnee[index];
    // Sélectionner tous les inputs avec le nom "reponse"
    const inputs = document.querySelectorAll('input[type="text"][name="reponse"]');

    // Parcourir chaque input
    reponse = ""
    inputs.forEach(input => {
        // Récupérer la valeur de l'input et supprimer les espaces en début et fin
        let valeur = input.value.trim();

        // Si la valeur n'est pas vide
        if (valeur) {
            // Supprimer toute ponctuation et remplacer par un espace
            valeur = valeur.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');
            // Remplacer les espaces multiples par un seul espace
            valeur = valeur.replace(/\s{2,}/g, ' ');
            // Convertir en minuscules
            valeur = valeur.toLowerCase();
            // Ajouter chaque mot non vide à la liste
            reponse += " " + valeur
        }
    });
    console.log("reponse utilisateur : ", reponse)
    console.log("reponse correct : ", item)
    if (item.reponses.includes(reponse)) {
      resultats[index] = true;
    } else {
      resultats[index] = false;
    }

    // Afficher la liste de mots
    console.log(resultats);

    index++;
    affichageDonnee();
  }
}

function completezHTML(item) {
  let html = `
  <h2>${item.categorie}</h2>
  (pour le nombre de mots : d'ici = 2 mots)<p>
  `
  for (const element of item.intitule) {
    html += `${element} `;
    html += `<input type="text" name="reponse"> `;
  }
  html = html.slice(0,-33);
  html += `</p>`;
  return html;
}

function resultatsHTML() {
  let html = `<h2>Résultats</h2>`;
  nombreBonnesReponses = Object.values(resultats).filter(resultat => resultat).length;
  html += `<p>Vous avez obtenu ${nombreBonnesReponses} bonnes réponses sur ${Object.keys(resultats).length} questions.</p>`;
  return html;

}

function detailResultatsHTML() {
  let html = `<h2>Résultats</h2><ul>`;
  for (const [index, resultat] of Object.entries(resultats)) {
    html += `<li>Question ${index}: ${resultat ? 'Correct' : 'Incorrect'}</li>`;
  }
  html += `</ul>`;
  return html;
}


// Écouteurs d'événements pour les boutons
document.getElementById('valider').addEventListener('click', valider);

document.getElementById('detailResultats').addEventListener('click', detailResultatsHTML);

// Charger les données au démarrage
chargementDonnees();
