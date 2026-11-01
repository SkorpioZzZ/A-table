# À table

À table est une petite application de recettes pour choisir facilement quoi préparer. Elle propose une roulette, quelques filtres et un espace pour gérer ses recettes.

## Fonctionnalités

- Faire tourner la roulette parmi les recettes incluses.
- Filtrer par durée, type de plat et déjeuner ou dîner.
- Ajouter, modifier et supprimer des recettes dans **Mes recettes**.
- Cocher les recettes à inclure dans la roulette.
- Retrouver la recette avec ses ingrédients et ses étapes.
- Utiliser l’application hors ligne après son premier chargement.

## Prévisualiser le projet sur un PC

Python sert uniquement à lancer un petit serveur local pour prévisualiser l’application sur un PC. Il n’est pas utilisé par l’application et n’est pas nécessaire sur le téléphone. Le projet n’utilise pas de dépendances à installer ni d’étape de compilation.

Il faut servir le dossier en HTTP plutôt que d’ouvrir `index.html` directement, afin que le service worker puisse fonctionner.

Avec Python installé, depuis le dossier du projet :

```bash
python3 -m http.server 8000
```

Ouvrez ensuite <http://localhost:8000> dans un navigateur.

## Installer sur un téléphone

Le projet contient un manifeste d’application, une icône et un service worker pour l’installation et le cache hors ligne **https://skorpiozzz.github.io/A-table/** : il faudra d’abord l’héberger sur un site accessible en HTTPS. Le chemin `file://` vers un fichier de l’ordinateur ne peut pas servir de lien d’installation.

Une fois le site hébergé :

### Android

1. Ouvrir le lien HTTPS dans Chrome.
2. Choisir **Installer l’application** ou **Ajouter à l’écran d’accueil** dans le menu du navigateur.
3. Lancer **À table** depuis l’icône ajoutée à l’écran d’accueil.

### iPhone

1. Ouvrir le lien HTTPS dans Safari.
2. Toucher **Partager**, puis **Sur l’écran d’accueil**.
3. Ajouter l’icône, puis lancer **À table** depuis l’écran d’accueil.

L’installation depuis l’écran d’accueil ouvre l’application dans une fenêtre dédiée. Après le premier chargement, le service worker conserve les fichiers de l’application pour pouvoir la rouvrir hors ligne.

## Recettes et sauvegarde

Les recettes fournies avec l’application sont dans `src/data/recipes.js`. Quand une personne ajoute, modifie, supprime ou désactive une recette dans **Mes recettes**, la liste est sauvegardée dans le stockage local du navigateur sur l’appareil utilisé.

Par exemple, les changements faits par votre mère depuis l’application installée seront gardés sur son téléphone. Ils resteront disponibles hors ligne après le premier chargement, mais ne seront pas automatiquement copiés sur votre téléphone. Aucune base de données externe n’est nécessaire pour cet usage. Les données peuvent toutefois être perdues si le stockage du site ou les données du navigateur sont effacés.

Pour synchroniser les recettes entre plusieurs appareils, il faudra ajouter une base de données en ligne et un mécanisme de synchronisation. Les recettes personnelles ne sont pas incluses dans le dépôt GitHub.

## Structure du projet

```text
index.html                 Page de l’application
manifest.webmanifest       Nom, icône et mode d’ouverture mobile
service-worker.js          Cache hors ligne des fichiers de l’application
icons/                     Icônes PNG et SVG
src/app.js                 Roulette, filtres et gestion des recettes
src/data/recipes.js        Recettes fournies avec l’application
src/services/              Filtrage et sauvegarde locale
src/styles/                 Mise en forme
```

## Marmiton

L’application ne se connecte pas à Marmiton et ne sait pas encore importer une recette depuis son adresse. Pour l’ajouter aujourd’hui, il faut la saisir dans **Mes recettes** ; elle sera alors sauvegardée localement sur l’appareil utilisé, comme les autres recettes personnelles.

Marmiton indique que ses recettes peuvent être utilisées à titre privé, tout en encadrant l’extraction et la reproduction de sa base de données. Un import automatique devrait donc être étudié au regard de ses conditions et pourrait aussi être fragile si le site change. Voir les [conditions d’utilisation de Marmiton](https://www.marmiton.org/sp/aide/conditions-generales-utilisation.html).

Une évolution plus simple serait d’ajouter à une recette un lien vers sa page d’origine, pour l’ouvrir directement sur Marmiton sans copier son contenu dans l’application.
