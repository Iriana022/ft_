# ft_transcendence

Bienvenue sur notre projet **ft_transcendence**, le dernier défi du tronc commun de 42.  
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
docker compose up --build -d
```

### 2. Config env
```bash
cd backend 
cp .env.example .env
```
+ fill env var(client ID and client secret)

### 3. Migration
```bash
docker exec -it nest_backend npx prisma migrate dev --name <migration name>
docker exec -it nest_backend npx prisma db push
```

## 🚀 Démarrage sur navigateur
+ Allez sur votre navigateur
+ Taper http://localhost:5173
+ Inscrivez vous dans register
+ Connectez-vous dans l'interface de connexion
+ Enjoy it <br>
![alt text](kermit.png)


## Les membres de l'équipe (Team members)
Pour la réalisation de ce projet, nous sommes quatres personnes. Voici nos contributions respéctives :
- **Product Owner(PO) and developer**: Mihangy(Pmihangy)
- **Product Manager(PM)/Scrum Master and developer**: Sahaza(Srasolom).
- **Technical Lead / Architect and developper**: Iriana(Irazafim).
- **Developper**: Finaritra(Vmpianim)

## Commit message convention

| Type     | Description |
|----------|-------------|
| feat     | A new feature |
| fix      | A bug fix |
| docs     | Documentation changes (e.g., README, comments) |
| style    | Code style changes (e.g., formatting, missing semicolons) |
| refactor | Code refactoring (no new features or bug fixes) |
| perf     | Performance improvements |
| test     | Adding or modifying tests |
| build    | Build system or dependency changes (e.g., npm, Docker, CI/CD) |
| ci       | CI/CD configuration changes |
| chore    | Maintenance tasks (e.g., updating configs, cleaning up files) |
| revert   | Reverts a previous commit |
