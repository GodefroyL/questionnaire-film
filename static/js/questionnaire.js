// Variable pour stocker les données et l'index courant
let donnee = [];
let index = 0;

// Fonction pour charger le fichier JSON
async function chargementDonnees() {
  try {
    const response = await fetch('{{ site.url }}/static/json/questions.json');
    donnee = await response.json();
    affichageDonnee();
  } catch (error) {
    console.error("Erreur lors du chargement du fichier JSON :", error);
  }
}

// Fonction pour afficher les données
function affichageDonnee() {
  const container = document.getElementById('data-container');
  if (index < donnee.length) {
    const item = donnee[index];
    container.innerHTML = `
      <p><strong>ID :</strong> ${item.id}</p>
      <p><strong>Question :</strong> ${item.question}</p>
      <p><strong>Réponse :</strong> ${item.reponse}</p>
    `;
  } else {
    container.innerHTML = "<p>Toutes les données ont été traitées.</p>";
  }
}

// Fonction pour valider l'élément courant
function validate() {
  if (currentIndex < donnee.length) {
    // Logique pour enregistrer la validation (ex: envoyer à un serveur)
    console.log(`Élément ${donnee[currentIndex].id} validé.`);
    currentIndex++;
    affichageDonnee();
  }
}

// Écouteurs d'événements pour les boutons
document.getElementById('valider').addEventListener('click', validate);

// Charger les données au démarrage
chargementDonnees();
