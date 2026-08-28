fetch('../static/json/liste_film.json')
    .then(reponse => reponse.json())
    .then(fichiersJSON => {
        const conteneur = document.getElementById('accueil_film');
        let ligneActuelle = null;
        const listeCouleurs = ['var(--vert)', 'var(--jaune)', 'var(--rouge)', 'var(--bleu)', 'var(--marron)']

        fichiersJSON.forEach((info_fichier, index) => {
            if (index % 4 === 0) {
                ligneActuelle = document.createElement('div');
                ligneActuelle.className = 'ligne';
                conteneur.appendChild(ligneActuelle);
            }

            const bouton = document.createElement('a');
            bouton.href = `https://godefroyl.github.io/questionnaire-film/html/questionnaire?film=${index}`;
            bouton.className = 'bouton_par_film';
            bouton.textContent = info_fichier.nom;
            bouton.style.backgroundColor = listeCouleurs[(~~(index / 4)) % 5];

            const image = document.createElement('img');
            image.src = `{ site.url }${info_fichier.image}.jpg`;
            image.alt = info_fichier.nom;
            bouton.insertBefore(image, bouton.firstChild);

            ligneActuelle.appendChild(bouton);
        });
    })
    .catch(erreur => console.error('Erreur:', erreur));