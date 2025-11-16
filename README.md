# Pickleball Scoreboard

Application front-end (HTML/CSS/JS vanilla) qui joue le rôle d'assistant officiel :
elle suit le score, annonce les serveurs, refuse les actions invalides et applique
automatiquement les règles du simple ou du double.

## Fonctionnalités clés

- Cartes équipes avec noms éditables (équipe + deux joueurs) et mise en évidence du serveur actif
- Tableau de bord central qui affiche le score officiel, le serveur en cours, le côté de service, la prochaine annonce ainsi que la dernière action enregistrée
- Gestion complète du format doubles/simples, y compris la règle du « serveur unique » pour le tout premier service du match
- Boutons d'actions guidées (point, faute de service, attribution manuelle du service, annulation) qui empêchent les scénarios impossibles
- Calcul automatique des balles de match, du message de victoire et du respect de l'écart à gagner configurable
- Historique permettant d'annuler la dernière action et champs pour fixer le nombre de points et l'écart de victoire

## Règles couvertes

- **Seule l'équipe au service peut marquer.** Une tentative de point pour l'équipe en réception affiche une erreur et ne modifie pas le score.
- **Rotation des serveurs en doubles.** Le serveur 1 commence, le serveur 2 n'entre en jeu qu'après une faute du serveur 1, et un side-out transfère le service à l'autre équipe. Pour le premier service du match, seul le serveur 1 est utilisé.
- **Mode simples.** Un seul serveur par équipe, changement immédiat de service en cas de faute, côté de service calculé selon la parité du score.
- **Annonces officielles.** L'interface affiche en permanence la séquence `score serveur – score receveur – numéro de serveur` et indique le côté (droite/gauche) associé au serveur courant.

## Utilisation

1. Choisir le format (doubles par défaut ou simples) et, si besoin, ajuster les valeurs « Points pour gagner » et « Victoire par ».
2. Lancer la partie avec « Nouvelle partie » puis utiliser les boutons d'action :
   - « Point équipe … » pour valider un échange gagné au service.
   - « Faute de service » pour faire progresser le serveur (ou provoquer un side-out) selon les règles.
   - « Donner le service à … » pour corriger manuellement l'équipe qui sert ou définir l'équipe qui commence.
   - « Annuler la dernière action » pour revenir en arrière grâce à l'historique interne.
3. Le panneau central rappelle l'état complet du match et annonce automatiquement la victoire lorsque l'écart requis est atteint.

## Démarrage

Aucun build n'est nécessaire. Il suffit d'ouvrir `index.html` dans votre navigateur préféré ou d'utiliser une extension type « Live Server » pour bénéficier du rechargement automatique.
