# Ajouter des profiles

L'application lit les profiles depuis le dossier défini par la variable d'environnement `PROFILES_BASE_DIR`.

## Préparer le dossier local

Depuis la racine du dépôt, créer le dossier attendu :

```powershell
New-Item -ItemType Directory -Force -Path data\profiles\profiles
Copy-Item packages\app-nextjs\.env.example packages\app-nextjs\.env.local
```

La valeur fournie dans `.env.example` est adaptée au lancement depuis le workspace Next.js :

```dotenv
PROFILES_BASE_DIR=../../data/profiles/profiles
```

`data/profiles/` et `.env.local` sont volontairement ignorés par Git : les données réelles peuvent contenir des informations qui ne doivent pas être publiées.

## Ajouter un premier profile de démonstration

Des profiles fictifs versionnés sont disponibles dans `packages/core/src/tests/fixtures/profiles`. Pour en installer un dans l'application :

```powershell
Copy-Item packages\core\src\tests\fixtures\profiles\bohort data\profiles\profiles\bohort -Recurse
```

Le résultat attendu est :

```text
data/
└── profiles/
    └── profiles/
        └── bohort/
            ├── profile.json
            ├── git-activity.json
            └── ...
```

## Créer un nouveau profile

Chaque profile possède son propre dossier directement sous `PROFILES_BASE_DIR`. Le fichier `profile.json` doit être placé à la racine de ce dossier.

Exemple minimal :

```json
{
  "profile_id": "john-doe",
  "available": [],
  "role": "fullstack",
  "experience_years": 5,
  "stack": ["TypeScript", "React"],
  "team_size": 4
}
```

`profile_id` et `available` sont les deux champs obligatoires. Les autres champs sont optionnels ou nullables.

Les sources reconnues dans `available` sont :

```text
git-activity.json
pull-requests.json
sonar-measures.json
repo-context/
sprint-metrics.json
declaratif.md
session.md
code/
delivery-confidence.json
```

Les fichiers de données supplémentaires peuvent être rangés dans un sous-dossier du profile : le repository les recherche récursivement. `repo-context/` est toutefois attendu directement à la racine du profile pour analyser son contenu.

Les schémas détaillés des sources sont documentés dans [`doc/infra/schemas`](infra/schemas/00.profiles-comparison.md). Le schéma de `delivery-confidence.json` se trouve dans [`doc/PA/newAxe/newAxe-schéma.md`](PA/newAxe/newAxe-schéma.md).

## Démarrer et vérifier

Depuis la racine du dépôt :

```powershell
npm install
npm run dev --workspace=packages/app-nextjs
```

Vérifier ensuite :

- `http://localhost:3000/api/profiles` doit contenir le `profile_id` ajouté ;
- `http://localhost:3000/profiles` doit afficher une ligne pour ce profile ;
- cliquer sur la ligne doit lancer son évaluation.

Après toute modification de `.env.local`, redémarrer le serveur Next.js.

## Utiliser un autre emplacement

`PROFILES_BASE_DIR` accepte un chemin absolu ou un chemin relatif au dossier depuis lequel Next.js est exécuté. Pour éviter une résolution différente entre les environnements, un chemin absolu est recommandé en déploiement.

Exemple Windows :

```dotenv
PROFILES_BASE_DIR=C:\data\laivel-up\profiles
```

Chaque sous-dossier direct de ce chemin est considéré comme un profile candidat. Un dossier sans `profile.json` valide est ignoré par la liste.
