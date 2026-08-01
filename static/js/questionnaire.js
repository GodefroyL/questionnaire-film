// Encapsulation des variables globales dans une IIFE pour éviter les conflits
(function() {
    // Sélecteurs DOM stockés dans des variables pour éviter les appels répétés
    const questionContainer = document.getElementById('question');
    const validerButton = document.getElementById('valider');
    const detailResultatsButton = document.getElementById('detailResultats');
    const divDetail = document.getElementById('divDetail');

    // Variables internes
    let donnee = [];
    let index = -1;
    let resultats = {};
    let currentDraggedElement = null;

    // Fonction principale pour lancer le questionnaire
    function main() {
        chargementDonnees();
        affichageQuestion();
    }

    // Fonction pour charger le fichier JSON
    async function chargementDonnees() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const questionnaire = urlParams.get('questionnaire');
            const niveau = urlParams.get('niveau') ?? '';
            const questions = await fetch(`../static/json/${questionnaire}_${niveau}.json`);
            donnee = await questions.json();
            console.log(`Chargement du questionnaire: ${questionnaire}, niveau: ${niveau} avec ${donnee.length} questions.`);
        } catch (error) {
            console.error("Erreur lors du chargement du fichier JSON :", error);
        }
    }

    // Fonction pour afficher les données
    function affichageQuestion() {
        index++;
        if (index < donnee.length) {
            const item = donnee[index];
            let html = '';
            
            // Réinitialiser la classe de la question
            questionContainer.className = '';
            
            // Utilisation d'un switch-case pour gérer les différentes catégories
            // 1 : Quel film
            // 2 : Qui parle
            // 3 : A qui est adressé cette phrase
            // 4 : Phrase d'avant
            // 5 : Phrase d'après
            // 6 : Remettre dans l'ordre
            // 7 : Citation à trous
            // 8 : Question de détail
            
            // Mapper les noms de catégories aux numéros
            const categorieMap = {
                "Quel film": 1,
                "Qui parle": 2,
                "A qui est adressé cette phrase": 3,
                "Phrase d'avant": 4,
                "Phrase d'après": 5,
                "Remettre dans l'ordre": 6,
                "Citations à trous": 7,
                "Question de détail": 8
            };
            
            const categorieNum = categorieMap[item.categorie] || 0;
            
            switch (categorieNum) {
                case 1: // Quel film
                case 2: // Qui parle
                case 3: // A qui est adressé cette phrase
                case 4: // Phrase d'avant
                case 5: // Phrase d'après
                case 8: // Question de détail
                    // Diapositive 1
                    questionContainer.classList.add('diapositive-1');
                    html = `
                        <div class="diapositive-1-content">
                            <h2>${item.categorie}</h2>
                            <p class="question-text">${item.intitule}</p>
                            <input type="text" name="reponse" class="reponse-input" placeholder="Votre réponse">
                        </div>
                    `;
                    break;
                    
                case 7: // Citations à trous
                    // Diapositive 2
                    questionContainer.classList.add('diapositive-2');
                    html = genererCitationATrous(item);
                    break;
                    
                case 6: // Remettre dans l'ordre
                    // Diapositive 3
                    questionContainer.classList.add('diapositive-3');
                    html = genererRemettreDansOrdre(item);
                    break;
                    
                default:
                    // Par défaut : Diapositive 1
                    questionContainer.classList.add('diapositive-1');
                    html = `
                        <div class="diapositive-1-content">
                            <h2>${item.categorie}</h2>
                            <p class="question-text">${item.intitule}</p>
                            <input type="text" name="reponse" class="reponse-input" placeholder="Votre réponse">
                        </div>
                    `;
                    break;
            }
            
            questionContainer.innerHTML = html;
            
            if (!item.programme) {
                questionContainer.innerHTML += `<p class="hors-programme"><em>Cette question porte sur un film hors programme.</em></p>`;
            }
            
            // Initialiser le drag and drop pour la catégorie 6
            if (categorieNum === 6) {
                initDragAndDrop();
            }
        } else {
            detailResultatsButton.style.display = "block";
            validerButton.style.display = "none";
            questionContainer.innerHTML = resultatsHTML();
        }

        // Appliquer l'adaptation de largeur à tous les inputs (event delegation)
        setupInputWidthAdjustment();
    }

    // Fonction pour générer le HTML pour les citations à trous
    function genererCitationATrous(item) {
        let html = `
            <div class="diapositive-2-content">
                <h2>${item.categorie}</h2>
                <p class="question-text">`;
                
        if (Array.isArray(item.intitule)) {
            for (const element of item.intitule) {
                if (element.startsWith('(') && element.endsWith(')')) {
                    // C'est un indicateur de nombre de mots, on l'affiche en petit
                    html += `<span class="indice-mots">${element}</span> `;
                } else {
                    html += `${element} `;
                }
            }
            html += `<input type="text" name="reponse" class="reponse-trou" placeholder="...">`;
        } else {
            html += `${item.intitule} <input type="text" name="reponse" class="reponse-trou" placeholder="...">`;
        }
        
        html += `
                </p>
            </div>
        `;
        return html;
    }

    // Fonction pour générer le HTML pour remettre dans l'ordre
    function genererRemettreDansOrdre(item) {
        let mots = [];
        
        if (Array.isArray(item.intitule)) {
            // Si intitule est un tableau, on l'aplatit
            mots = item.intitule.flatMap(el => {
                if (typeof el === 'string' && !el.startsWith('(')) {
                    return el.split(' ').filter(m => m.trim() !== '');
                }
                return [];
            });
        } else if (typeof item.intitule === 'string') {
            mots = item.intitule.split(' ').filter(m => m.trim() !== '');
        }
        
        // Mélanger les mots
        mots = shuffleArray(mots);
        
        let html = `
            <div class="diapositive-3-content">
                <h2>${item.categorie}</h2>
                <p class="question-text">Remettez les éléments dans l'ordre :</p>
                <div class="mots-container" id="mots-container">
        `;
        
        for (let i = 0; i < mots.length; i++) {
            html += `
                <div class="mot" draggable="true" data-index="${i}">
                    <span class="mot-texte">${mots[i]}</span>
                    <input type="number" class="mot-numero" min="1" max="${mots.length}" placeholder="${i + 1}">
                </div>
            `;
        }
        
        html += `
                </div>
            </div>
        `;
        return html;
    }

    // Fonction pour mélanger un tableau (algorithme de Fisher-Yates)
    function shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    // Fonction pour initialiser le drag and drop
    function initDragAndDrop() {
        const container = document.getElementById('mots-container');
        if (!container) return;
        
        const mots = container.querySelectorAll('.mot');
        
        // Ajouter les écouteurs pour le drag and drop
        mots.forEach(mot => {
            mot.addEventListener('dragstart', (e) => {
                currentDraggedElement = mot;
                e.dataTransfer.setData('text/plain', mot.dataset.index);
                mot.classList.add('dragging');
            });
            
            mot.addEventListener('dragend', () => {
                mot.classList.remove('dragging');
                currentDraggedElement = null;
                updateNumerosFromOrder();
            });
            
            mot.addEventListener('dragover', (e) => {
                e.preventDefault();
                const target = e.target.closest('.mot');
                if (target && target !== currentDraggedElement) {
                    const container = target.parentElement;
                    const rect = target.getBoundingClientRect();
                    const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                    
                    if (next) {
                        container.insertBefore(currentDraggedElement, target.nextSibling);
                    } else {
                        container.insertBefore(currentDraggedElement, target);
                    }
                }
            });
            
            // Synchroniser les numéros quand on change manuellement
            mot.querySelector('.mot-numero').addEventListener('input', () => {
                updateOrderFromNumeros();
            });
        });
        
        // Initialiser les numéros
        updateNumerosFromOrder();
    }

    // Mettre à jour les numéros en fonction de l'ordre des éléments
    function updateNumerosFromOrder() {
        const container = document.getElementById('mots-container');
        if (!container) return;
        
        const mots = container.querySelectorAll('.mot');
        mots.forEach((mot, index) => {
            const numeroInput = mot.querySelector('.mot-numero');
            if (numeroInput) {
                numeroInput.value = index + 1;
            }
        });
    }

    // Mettre à jour l'ordre des éléments en fonction des numéros
    function updateOrderFromNumeros() {
        const container = document.getElementById('mots-container');
        if (!container) return;
        
        const mots = Array.from(container.querySelectorAll('.mot'));
        
        // Trier les mots en fonction de leur numéro
        mots.sort((a, b) => {
            const numA = parseInt(a.querySelector('.mot-numero').value) || 0;
            const numB = parseInt(b.querySelector('.mot-numero').value) || 0;
            return numA - numB;
        });
        
        // Réorganiser les éléments dans le DOM
        mots.forEach(mot => {
            container.appendChild(mot);
        });
        
        // Mettre à jour les numéros après réorganisation
        updateNumerosFromOrder();
    }

    // Fonction pour valider l'élément courant
    function valider() {
        if (index < donnee.length) {
            const item = donnee[index];
            const categorieMap = {
                "Quel film": 1,
                "Qui parle": 2,
                "A qui est adressé cette phrase": 3,
                "Phrase d'avant": 4,
                "Phrase d'après": 5,
                "Remettre dans l'ordre": 6,
                "Citations à trous": 7,
                "Question de détail": 8
            };
            const categorieNum = categorieMap[item.categorie] || 0;
            
            let reponse = "";
            
            if (categorieNum === 6) {
                // Cas spécial pour "Remettre dans l'ordre"
                const mots = Array.from(document.querySelectorAll('#mots-container .mot'));
                const orderedMots = mots.map(mot => mot.querySelector('.mot-texte').textContent);
                reponse = orderedMots.join(' ');
            } else {
                // Cas normal : récupérer les inputs text
                const inputs = document.querySelectorAll('input[type="text"][name="reponse"]');
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
            }
            
            const isCorrect = item.reponses.includes(reponse);
            resultats[index] = isCorrect;

            // Appliquer l'animation en fonction du résultat
            if (isCorrect) {
                questionContainer.classList.add('success');
            } else {
                questionContainer.classList.add('error');
            }

            // Retirer l'animation après son exécution
            setTimeout(() => {
                questionContainer.classList.remove('success', 'error');
                affichageQuestion();
            }, 300);
        }
    }

    // Fonction pour ajuster la largeur des inputs (utilise event delegation)
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

    function resultatsHTML() {
        let html = `<div class="resultats-container"><h2>Résultats</h2>`;
        const nombreBonnesReponses = Object.values(resultats).filter(resultat => resultat).length;
        html += `<p>Vous avez obtenu ${nombreBonnesReponses} bonnes réponses sur ${Object.keys(resultats).length} questions.</p></div>`;
        return html;
    }

    function detailResultatsHTML() {
        divDetail.style.display = "block";
        detailResultatsButton.style.display = "none";
        let html = `<h2>Résultats détaillés</h2><ul>`;
        for (const [index, resultat] of Object.entries(resultats)) {
            const item = donnee[index];
            html += `<li>Question ${parseInt(index) + 1}: ${item.intitule} ${resultat ? '<span style="color: green;">✓ Correct</span>' : '<span style="color: red;">✗ Incorrect</span>'}</li>`;
        }
        html += `</ul>`;
        divDetail.innerHTML = html;
    }

    // Écouteurs d'événements pour les boutons
    validerButton.addEventListener('click', valider);
    detailResultatsButton.addEventListener('click', detailResultatsHTML);

    // Charger les données au démarrage
    chargementDonnees();
})();
