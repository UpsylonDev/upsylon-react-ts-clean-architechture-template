# Prettier - Code Formatting Guide

Ce projet utilise **Prettier** pour assurer une cohérence de formatage du code à travers toute la codebase.

## Configuration

### Règles Prettier (`.prettierrc`)

```json
{
  "singleQuote": false,
  "trailingComma": "none",
  "tabWidth": 2,
  "semi": false
}
```

**Explications :**

- `singleQuote: false` - Utilise des guillemets doubles (`"`) au lieu de simples (`'`)
- `trailingComma: none` - Pas de virgule finale dans les listes
- `tabWidth: 2` - Indentation de 2 espaces
- `semi: false` - Pas de point-virgule en fin de ligne

### Fichiers ignorés (`.prettierignore`)

Les dossiers suivants sont exclus du formatage :

- `node_modules/`
- `dist/`, `build/`, `coverage/`
- `.git/`, `.husky/`, `.vscode/`, `.idea/`
- Fichiers de cache et logs

## Utilisation

### Formater manuellement

```bash
# Formater tous les fichiers
pnpm format

# Vérifier le formatage sans modifier les fichiers
pnpm format:check

# Formater un fichier spécifique
npx prettier --write src/filename.ts
```

### Formatage automatique sur commit

**Husky + lint-staged** exécute automatiquement le formatage à chaque commit :

```
git add .
git commit -m "mon message"
↓
┌─ Pre-commit hook triggered
├─ Files staged → lint-staged
├─ TypeScript/JavaScript → prettier + eslint --fix
├─ JSON/CSS/Markdown → prettier
└─ Commit validé
```

**Configuration dans `package.json` :**

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": [
    "prettier --write",
    "eslint --fix"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

## Intégration VSCode

Pour une meilleure expérience dans VSCode :

1. **Installer l'extension Prettier**
   - Extension : "Prettier - Code formatter"
   - ID : `esbenp.prettier-vscode`

2. **Configurer comme formateur par défaut**
   - Ouvrir `settings.json` (Ctrl+Shift+P → Preferences: Open Settings (JSON))
   - Ajouter :

   ```json
   "[typescript]": {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true
   },
   "[typescriptreact]": {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true
   },
   "[javascript]": {
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.formatOnSave": true
   }
   ```

3. **Format au sauvegarde**
   - Format automatique quand vous sauvegardez (Ctrl+S)

## Workflow recommandé

### Avant de committer

```bash
# Option 1 : Formater manuellement
pnpm format

# Option 2 : Laisser Husky formater automatiquement
git add .
git commit -m "message"  # Husky formatte avant le commit
```

### CI/CD

Dans les pipelines CI/CD, vérifier que le code est bien formaté :

```bash
pnpm format:check
```

## Résolution de problèmes

### Conflit entre ESLint et Prettier

Les deux outils sont configurés pour travailler ensemble via `eslint-plugin-prettier` :

- ESLint exécute Prettier comme une règle
- ESLint corrige les violations Prettier avec `eslint --fix`

### Les fichiers ne se formatent pas au commit

Vérifier que :

1. Husky est installé : `ls -la .husky/`
2. Le hook pre-commit existe : `cat .husky/pre-commit`
3. Les permissions sont correctes : `chmod +x .husky/pre-commit`

### Formater les fichiers existants

Pour formater tout le projet d'un coup :

```bash
pnpm format
```

## Ressources

- [Documentation Prettier](https://prettier.io/docs/en/index.html)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [ESLint + Prettier](https://prettier.io/docs/en/integrating-with-linters.html)
