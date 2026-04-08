# Formulaire inscription guide

Application React basee sur Next.js pour prototyper une creation de compte
pedagogique autour du peer-to-peer, des trackers prives et du systeme de ratio.

Le prototype contient :

- un formulaire de profil front-end ;
- des cartes d'information sur le peer-to-peer ;
- un mini-jeu pour comprendre l'impact du seed et du telechargement sur le ratio ;
- un QCM avec score minimum avant finalisation ;
- un bouton de creation de compte demo sans persistance serveur.

## Prérequis

- Node.js 20 ou plus récent
- npm

## Démarrage

```bash
npm install
npm run dev
```

Ouvre ensuite http://localhost:3000.

## Note

Le peer-to-peer est une technologie neutre. Ce prototype est formule pour
encourager un usage legal, avec des contenus dont l'utilisateur possede les
droits ou qui sont libres de diffusion.

## Scripts

- `npm run dev` lance le serveur de développement.
- `npm run build` compile l'application pour la production.
- `npm run start` lance l'application compilée.
- `npm run lint` exécute ESLint.
