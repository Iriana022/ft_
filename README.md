# 🏓 ft_transcendence

Bienvenue sur nos projet **ft_transcendence**, le dernier défi du tronc commun de 42.  
Il s'agit d'une plateforme web complète permettant de jouer au Pong en temps réel, de chatter avec d'autres utilisateurs et de suivre ses statistiques.

---

## 🏗 Architecture du Projet
Le projet est architecturé en **monorepo** pour simplifier le déploiement et la gestion des environnements :
- **Backend**: NestJS avec Prisma ORM.
- **Frontend**: React (ou Next.js).
- **Base de données**: PostgreSQL.
- **Conteneurisation**: Docker & Docker Compose.

---

## 🚀 Installation Rapide (Environnement Linux)

### 1. Cloner le projet
```bash
git clone <URL_DE_TON_REPO> ft_transcendence
cd ft_transcendence

# Dans le dossier backend
cd backend
npm install   # ou pnpm install

# Dans le dossier frontend
cd ../frontend
npm install

# Générer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev --name init

# Ouvrir l'interface visuelle de la DB
npx prisma studio
