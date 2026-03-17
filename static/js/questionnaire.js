// Variable pour stocker les données et l'index courant
let donnee = [];
let index = 1;

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
    console.log("Catégorie :", item.categorie);
    if (item.categorie == "Complétez") {
      container.innerHTML = completezHTML(item);
    } else {
      container.innerHTML = `
        <h2>${item.categorie}</h2>
        <p>${item.intitule}</p>
        <input type="text" id="reponse">`;
    }
    if (!item.programme) {
      container.innerHTML += `<p><em>Cette question porte sur un film hors programme.</em></p>`;
    }
    index++;
  } else {
    container.innerHTML = "<p>Toutes les données ont été traitées.</p>";
  }
}

// Fonction pour valider l'élément courant
function validate() {
  if (index < donnee.length) {
    // Logique pour enregistrer la validation (ex: envoyer à un serveur)
    console.log(`Élément ${donnee[index].id} validé.`);
    index++;
    affichageDonnee();
  }
}

function completezHTML(item) {
  let html = `<h2>${item.categorie}</h2><p>`
  console.log("item.intitule:", item.intitule);
  for (const element of item.intitule) {
    console.log("Élément de l'intitulé:", element);
    html += `${element} `;
    html += `<input type="text" name="reponse"> `;
    console.log("HTML après ajout de l'input:", html);
  }
  html = html.replace(`<input type="text" id="reponse">`, `<input type="text" id="reponse">`);
  html += `</p>`;
  console.log("HTML généré:", html);
  return html;
}


// Écouteurs d'événements pour les boutons
document.getElementById('valider').addEventListener('click', validate);

// Charger les données au démarrage
chargementDonnees();
