# Explication Simple du Code 📖

## Qu'est-ce que cette application fait ?

C'est une **application de gestion de posts** (comme un petit blog). Tu peux :

- 📝 **Créer** des posts
- 👀 **Voir** la liste de tous les posts
- ✏️ **Modifier** un post
- ❌ **Supprimer** un post
- 💬 Chaque post peut avoir des **commentaires**

---

## Comment ça marche ? (Vue simple)

```
┌─────────────────────────────────────┐
│     L'utilisateur clique sur       │
│     "Créer un post"                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Le composant React (PostForm)     │
│   reçoit les données du formulaire  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   usePosts hook (logique métier)   │
│   traite la création du post       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   Envoie une requête à l'API       │
│   (crée le post en base de données)│
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   L'API retourne la réponse        │
│   avec les données du nouveau post  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   La liste des posts se met à      │
│   jour automatiquement à l'écran    │
└─────────────────────────────────────┘
```

---

## Les 4 couches du code

Imagine un gâteau avec 4 étages. Chacun a un rôle spécifique :

### 🍰 Étage 1 : Domaines (le cœur du gâteau)

**Fichiers:** `src/domains/`

C'est la **logique métier** pure. Ici on définit :

- **Post** : représente un post (titre, contenu, commentaires, auteur, dates)
- **Comment** : représente un commentaire
- **User** : représente un utilisateur
- **PostUseCase** : explique comment créer/modifier/supprimer des posts

**Important :** Cette couche **ne sait pas que React existe** ! C'est du code JavaScript pur.

```typescript
// Exemple : une Post avec ses commentaires
const post = {
  id: 1,
  title: "Mon premier post",
  content: "Contenu du post",
  author: { id: 1, name: "Jean" },
  comments: [
    { id: 1, content: "Beau post!", author: { id: 2, name: "Marie" } }
  ],
  createdAt: "2025-11-07",
  updatedAt: "2025-11-07"
}
```

---

### 🍰 Étage 2 : Adaptateurs (la colle du gâteau)

**Fichiers:** `src/adapters/`

C'est la couche qui **connecte les domaines avec le monde extérieur** :

- **Repositories** : va chercher/sauvegarde les données (comme un libraire qui va chercher des livres)
  - PostRepository : gère les posts dans la base de données
  - CommentRepository : gère les commentaires

- **ClientHTTP** : l'ambassadeur qui parle à l'API avec Axios

- **DTOs** : convertissent les données brutes de l'API en données du domaine

```typescript
// DTO brut de l'API
{
  post_id: 1,
  post_title: "Mon premier post",
  post_content: "Contenu du post"
}

// ↓ Transformation

// Post du domaine
{
  id: 1,
  title: "Mon premier post",
  content: "Contenu du post"
}
```

---

### 🍰 Étage 3 : Injection de dépendances (le liant du gâteau)

**Fichiers:** `src/di/`

C'est le **chef d'orchestre**. Il relie toutes les pièces :

1. Crée le client HTTP (pour parler à l'API)
2. Crée les repositories (qui utilisent le client HTTP)
3. Crée les use cases (qui utilisent les repositories)
4. Les retourne à React pour qu'il les utilise

**Analogie :** Tu ne fais pas de gâteau en mélangent tout d'un coup. Tu prépares les ingrédients, puis tu les ajoutes dans le bon ordre. C'est pareil ici.

---

### 🍰 Étage 4 : Frameworks (le décor du gâteau)

**Fichiers:** `src/frameworks/`

C'est la couche **React** (les composants visuels) :

- **Components** : affichent les posts, formulaires, etc.
  - `PostList` : liste tous les posts
  - `PostBox` : affiche un post
  - `PostForm` : formulaire pour créer un post

- **Hooks** : `usePosts` - la logique pour gérer les posts en React
  - Utilise les use cases du domaine
  - Gère l'état global avec Jotai
  - Donne aux composants les fonctions `getPosts()`, `createPost()`, etc.

- **Router** : définit les pages et la navigation

---

## Flux de données : Étape par étape

### Scénario : Création d'un nouveau post

**1️⃣ L'utilisateur clique sur "Créer"**

```
PostForm (composant React)
```

**2️⃣ Le formulaire envoie le titre et contenu**

```
const { createPost } = usePosts()
createPost(title, content)
```

**3️⃣ Le hook usePosts reçoit ça et utilise le use case**

```
postUseCase.createPost(title, content)
```

**4️⃣ Le use case appelle le repository**

```
postRepository.createPost(title, content)
```

**5️⃣ Le repository envoie une requête HTTP à l'API**

```
clientHTTP.post("/api/posts", { title, content })
```

**6️⃣ L'API (mock server) crée le post et retourne une réponse**

```
{ success: true, postId: 42 }
```

**7️⃣ Le hook récupère la liste à jour des posts**

```
postUseCase.getPosts()
```

**8️⃣ La liste est sauvegardée dans l'état global (Jotai)**

```
setPosts(newPostList)
```

**9️⃣ React re-affiche la liste avec le nouveau post**

```
✅ Nouveau post visible à l'écran !
```

---

## État global avec Jotai

Au lieu d'avoir plusieurs composants qui ne se parlent pas, on utilise **Jotai** pour avoir un **état partagé** :

```
┌──────────────┐
│ État global  │ ← Tous les posts sont ici
│  (Jotai)     │
└──────────────┘
      ▲         ▼
      │         │
   ┌──┴────┬────┴──┐
   │        │       │
PostList  PostBox  PostForm
```

- **PostList** : lit les posts dans l'état global
- **PostBox** : affiche un post et peut le modifier
- **PostForm** : crée un nouveau post et ajoute dans l'état global

Tout le monde voit les **mêmes données** automatiquement !

---

## Organisation du code

```
src/
├── domains/              ← Logique métier pure
│   ├── aggregates/       ← Post (contient des commentaires)
│   ├── entities/         ← Comment, User
│   ├── vos/              ← UserInfoVO (juste id + name)
│   ├── useCases/         ← PostUseCase (quoi faire avec les données)
│   ├── repositories/     ← Contrats pour la base de données
│   └── dtos/             ← Contrats pour l'API
│
├── adapters/             ← Connexion avec le monde extérieur
│   ├── repositories/     ← Implémentation pour chercher les données
│   ├── dtos/             ← Conversion API → Domaine
│   └── infrastructures/  ← Client HTTP (Axios)
│
├── di/                   ← Chef d'orchestre
│   ├── index.ts          ← Crée tout dans le bon ordre
│   ├── repositories.ts   ← Crée les repositories
│   └── useCases.ts       ← Crée les use cases
│
└── frameworks/           ← React (le décor)
    ├── components/       ← Atomes, molécules, organismes
    ├── hooks/            ← usePosts (logique React)
    ├── contexts/         ← État React
    └── pages/            ← Pages principales
```

---

## Analogie du monde réel 🌍

**Pense à une librairie :**

- **Domaines** = Les livres et les règles (un livre a un titre, un contenu, un auteur)
- **Repositories** = Le libraire (va chercher le livre demandé)
- **API** = L'entrepôt (stock de tous les livres)
- **Hooks** = Le guichet d'accueil (demande des livres, les affiche sur un présentoir)
- **Composants** = Le présentoir (affiche les livres pour que les clients les voient)
- **DI** = Le directeur (dit au libraire comment chercher, dit au guichet comment fonctionner)

L'avantage : **Si demain tu veux changer l'entrepôt, seul le libraire est affecté. Les livres, le guichet et le présentoir restent pareils.**

---

## Les bénéfices 🎯

| Bénéfice                | Pourquoi ?                                      |
| ----------------------- | ----------------------------------------------- |
| **Facile à tester**     | On peut tester la logique sans React            |
| **Facile à changer**    | Si l'API change, seul l'adaptateur change       |
| **Facile à comprendre** | Chaque couche a un seul rôle                    |
| **Réutilisable**        | La logique métier marche avec n'importe quel UI |
| **Maintenable**         | Les bugs se trouvent facilement                 |

---

## Résumé en 3 points 🎬

1. **Les domaines** contiennent la logique métier (quoi faire)
2. **Les adaptateurs** connectent le domaine avec l'API (comment le faire)
3. **React** affiche le résultat (comment le montrer à l'écran)

**Et le DI les relie tous ensemble !**

C'est comme faire un plat :

- 🥘 Recette = Domaines (quoi faire)
- 🛒 Courses = Adaptateurs (où trouver les ingrédients)
- 👨‍🍳 Cuisinier = DI (met tout ensemble)
- 🍽️ Assiette = React (voilà ton plat fini !)

---

## Déploiement avec Docker 🐳

L'application peut être déployée facilement avec Docker.

### Comment lancer l'application avec Docker ?

```bash
# Démarrer l'application
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter l'application
docker-compose down
```

L'application sera disponible sur **http://localhost:3000**

### Comment ça marche ?

**Docker fait 2 choses :**

**1️⃣ Build l'application** (comme `pnpm build`)

- Installe toutes les dépendances
- Compile le code TypeScript → JavaScript
- Génère les fichiers optimisés dans `/dist`

**2️⃣ Sert l'application avec nginx**

- nginx = un serveur web ultra rapide
- Il prend les fichiers dans `/dist` et les sert aux visiteurs
- Gère le routing de React Router (toutes les URLs mènent à `index.html`)

### Pourquoi utiliser Docker ?

| Avantage             | Explication                                         |
| -------------------- | --------------------------------------------------- |
| **Portable**         | Fonctionne partout : Windows, Mac, Linux, serveur   |
| **Isolé**            | L'application a son propre environnement            |
| **Rapide**           | nginx est ultra performant pour servir des fichiers |
| **Production-ready** | Configuration optimisée pour la production          |

### Architecture Docker

```
┌──────────────────────────────────────┐
│  Stage 1: Builder (Node.js 20)      │
│                                      │
│  1. Installe pnpm                    │
│  2. Installe les dépendances         │
│  3. Build l'application (pnpm build) │
│  4. Génère /dist                     │
└──────────────┬───────────────────────┘
               │
               ▼ (copie /dist)
┌──────────────────────────────────────┐
│  Stage 2: nginx (Production)        │
│                                      │
│  1. Prend uniquement /dist           │
│  2. Configure nginx                  │
│  3. Sert l'application sur port 80   │
│  4. Gestion SPA + cache + sécurité   │
└──────────────────────────────────────┘
```

**Résultat :** L'image finale est légère (seulement nginx + fichiers /dist, sans Node.js ni node_modules)
