# ft_transcendence

Bienvenue sur nos projet **ft_transcendence**, le dernier défi du tronc commun de 42.  
Il s'agit d'une plateforme web complète permettant de gerer des tickets de service de dev en temps reel.

---

## 🏗 Architecture du Projet
Le projet est architecturé en **ft_** pour simplifier le déploiement et la gestion des environnements :
- **Backend**: NestJS.
- **Frontend**: React (ou Next.js).
- **Base de données**: PostgreSQL.
- **ORM**: Prisma
- **CSS Library**: TailwindCSS
- **Conteneurisation**: Docker & Docker Compose.

---

## 🚀 Installation Rapide (Environnement Linux)

### 1. Cloner le projet
```bash
git clone https://github.com/Iriana022/ft_ ft_transcendence
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
