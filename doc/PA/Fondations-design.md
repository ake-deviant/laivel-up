# Fondations design

## Direction

L'interface utilise un bleu nuit comme couleur structurante, des surfaces bleu froid très claires et un accent bleu ciel. Les couleurs propres aux `level` et aux états fonctionnels conservent leur signification.

## Couleurs sémantiques

- `app` : fond général ;
- `surface` : cartes et zones principales ;
- `surface-muted` : groupes internes et contrôles secondaires ;
- `primary` : navigation, actions principales et zones de contraste ;
- `primary-hover` : interaction sur une action principale ;
- `accent` : focus, sélection et information active ;
- `border` : séparation standard ;
- `border-strong` : séparation renforcée ;
- `text` : contenu principal ;
- `text-muted` : contenu secondaire.

## Layout

- conteneur principal fluide avec `max-width` commun ;
- marge horizontale responsive ;
- rythme vertical commun entre `PageHeader` et `Section` ;
- grilles de cinq colonnes uniquement à partir d'une largeur desktop suffisante ;
- passage progressif à deux puis une colonne.

## Typographie

- titres courts et fortement contrastés ;
- labels en capitales réservés aux surtitres et catégories ;
- texte courant limité en largeur pour conserver la lisibilité ;
- valeurs numériques alignées avec `tabular-nums`.

## Interaction

- focus clavier visible avec la couleur `accent` ;
- surface de clic minimale de 40px pour les actions ;
- `disabled` visible sans supprimer totalement le contraste ;
- statut et sélection exprimés par du texte en plus de la couleur ;
- transition courte limitée aux couleurs, bordures et ombres.

## Surfaces

- `AppShell` porte le fond et la hauteur minimale ;
- `AppHeader` est bleu nuit et reste identique sur toutes les routes ;
- `Section` porte une surface claire, une bordure et un rayon communs ;
- les groupes internes utilisent `surface-muted` sans multiplier les ombres ;
- les ombres sont réservées aux surfaces interactives ou prioritaires.
