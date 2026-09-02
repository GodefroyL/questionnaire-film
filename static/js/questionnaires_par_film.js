fetch('../static/json/liste_film.json')
    .then(reponse => reponse.json())
    .then(fichiersJSON => {
        const conteneur = document.getElementById('accueil_film');
        const isMobile = window.matchMedia('(max-width: 550px)').matches;
        let ligneActuelle = null;
        const listeCouleurs = ['var(--vert)', 'var(--jaune)', 'var(--rouge)', 'var(--bleu)', 'var(--marron)']

        let film_par_colonne = isMobile ? 2 : 4;
        fichiersJSON.forEach((info_fichier, index) => {
            if (index % film_par_colonne === 0) {
                ligneActuelle = document.createElement('div');
                ligneActuelle.className = 'ligne';
                conteneur.appendChild(ligneActuelle);
            }

            const bouton = document.createElement('a');
            bouton.href = `https://godefroyl.github.io/questionnaire-film/html/questionnaire?film=${index}`;
            bouton.className = 'bouton_par_film';
            bouton.textContent = info_fichier.nom;
            bouton.style.backgroundColor = listeCouleurs[(~~(index / film_par_colonne)) % 5];

            const image = document.createElement('img');
            image.src = `${info_fichier.image}`;
            image.className = 'image_film'
            bouton.insertBefore(image, bouton.firstChild);

            ligneActuelle.appendChild(bouton);
        });
    })
    .catch(erreur => console.error('Erreur:', erreur));