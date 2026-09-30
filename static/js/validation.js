// validation.js
// Contient toute la logique de vérification des réponses, sortie de valider().
// Ce sont des fonctions "pures" (elles ne touchent ni au DOM ni aux variables globales).
//
// À charger dans la page HTML AVANT le script du questionnaire :
//   <script src="../static/js/validation.js"></script>
//   <script src="../static/js/questionnaire.js"></script>
// =============================================================================

// -----------------------------------------------------------------------------
// normaliser(texte)
// Remplace la longue chaîne de .replace() de l'ancienne valider().
// Principe : minuscules, accents retirés, puis tout ce qui n'est pas une lettre ou un chiffre devient un espace, et on termine par un trim().
// -----------------------------------------------------------------------------
function normaliser(texte) {
  return String(texte)
    .toLowerCase()                                      // texte en minuscule
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")   // supprime les accents
    .replace(/œ/g, "oe").replace(/æ/g, "ae")            // ligatures non décomposables
    .replace(/[^a-z0-9]+/g, " ")                        // ponctuation, apostrophes, tirets... -> espace
    .trim();                                            // trim après les remplacements
}

// -----------------------------------------------------------------------------
// distance(a, b)
// Distance de Levenshtein : nombre minimal d'insertions, suppressions ou substitutions pour passer de a à b. Sert à tolérer les fautes de frappe.
// -----------------------------------------------------------------------------
function distance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,                                   // suppression
        dp[i][j - 1] + 1,                                   // insertion
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)  // substitution
      );
    }
  }
  return dp[a.length][b.length];
}

// -----------------------------------------------------------------------------
// tolerance(valide)
// Nombre de fautes acceptées selon la longueur de la réponse attendue :
// 0 pour les mots très courts, puis de plus en plus large. Pour les longues phrases : 10 % de la longueur.
// -----------------------------------------------------------------------------
function tolerance(valide) {
  if (valide.length <= 4) return 0;
  if (valide.length <= 8) return 1;
  if (valide.length <= 20) return 2;
  return Math.floor(valide.length * 0.1);
}

// -----------------------------------------------------------------------------
// estCorrect(item, saisies, options)
//  - item     : la question courante (élément du JSON)
//  - saisies  : tableau des valeurs brutes des champs de saisie (un seul élément, sauf pour "Citation à trous")
//  - options.tolerant : true pour accepter de petites fautes de frappe (activé par défaut)
// Retourne true / false.
// -----------------------------------------------------------------------------
function estCorrect(item, saisies, { tolerant = true } = {}) {
  // Les champs sont joints puis normalisés d'un seul coup : les espaces
  // multiples ou les champs vides ne créent plus de décalage.
  const entree_utilisateur = normaliser(saisies.join(" "));

  // Une saisie vide n'est jamais correcte
  if (!entree_utilisateur) return false;

  const valides = item.reponses.map(r =>
    normaliser(Array.isArray(r) ? r.join(" ") : r)
  );

  // "Question de détail" : avant, .includes() sur une sous-chaîne, donc "148" ou "480" validaient la réponse "48". On cherche maintenant le mot ou groupe de mots ENTIER, en entourant de espaces les deux chaînes.
  if (item.categorie === "Question de détail") {
    return valides.some(v => (" " + entree_utilisateur + " ").includes(" " + v + " "));
  }

  // Autres catégories : égalité stricte après normalisation, avec en option une tolérance de fautes de frappe (distance de Levenshtein).
  return valides.some(v =>
    entree_utilisateur === v || (tolerant && distance(entree_utilisateur, v) <= tolerance(v))
  );
}
