# ft_transcendence

Welcome to **Tikeo**, our **ft_transcendence** project and the final challenge of the 42 common core.

**Tikeo** is a feedback ticket management platform designed to streamline communication between users and support teams in real time.

### 🎯 Project Description

Tikeo is built around three main user roles:

* **Client**:

  * Creates tickets (feedback, issues, requests)
  * Tracks ticket status in real time
  * Chats directly with the assigned agent

* **Agent**:

  * Takes ownership of tickets
  * Communicates with clients through a chat system
  * Updates ticket status and progress

* **Admin**:

  * Has full access to the platform
  * Manages users (clients and agents)
  * Can delete users, tickets, and moderate the system

This structure allows efficient ticket handling, real-time interaction, and full administrative control.

---

## 🏗 Project Architecture

The project is structured with **ft_** to simplify deployment and environment management:

* **Backend**: NestJS
* **Frontend**: React
* **Database**: PostgreSQL
* **ORM**: Prisma
* **CSS Library**: TailwindCSS
* **Containerization**: Docker & Docker Compose

---

## 🚀 Quick Installation (Linux Environment)

### 1. Clone the project

```bash
git clone https://github.com/Iriana022/ft_ ft_transcendence
cd ft_transcendence
make
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

* Fill in the required environment variables:

- **DATABASE_URL**: Connection string used by Prisma to access the PostgreSQL database (includes user, password, host, port, and database name).
- **GOOGLE_CLIENT_ID**: Public identifier of your application for Google OAuth authentication.
- **GOOGLE_CLIENT_SECRET**: Secret key associated with your Google OAuth application (must be kept private).
- **GOOGLE_REDIRECT_URI**: URL where Google redirects the user after successful authentication.
- **JWT_SECRET**: Secret key used to sign and verify JSON Web Tokens for user authentication.
- **ADMIN_LOGIN**: Default username for the initial admin account.
- **ADMIN_EMAIL**: Email address for the initial admin account.
- **ADMIN_PASSWORD**: Password for the initial admin account (should be changed in production).

## 🚀 Launch in Browser

* Open your browser
* Go to [https://localhost:8443](https://localhost:8443)
* Register a new account
* Log in through the authentication interface
* Enjoy it 🚀

![alt text](kermit.png)

---

## 👥 Team Members

This project was developed by a team of four people. Here are our respective roles:

* **Product Owner (PO) & Developer**: Mihangy (pmihangy)
* **Product Manager (PM) / Scrum Master & Developer**: Sahaza (srasolom)
* **Technical Lead / Architect & Developer**: Iriana (irazafim)
* **Developer**: Finaritra (vmpianim)

---

## 📝 Commit Message Convention

| Type     | Description                                                   |
| -------- | ------------------------------------------------------------- |
| feat     | A new feature                                                 |
| fix      | A bug fix                                                     |
| docs     | Documentation changes (e.g., README, comments)                |
| style    | Code style changes (e.g., formatting, missing semicolons)     |
| refactor | Code refactoring (no new features or bug fixes)               |
| perf     | Performance improvements                                      |
| test     | Adding or modifying tests                                     |
| build    | Build system or dependency changes (e.g., npm, Docker, CI/CD) |
| ci       | CI/CD configuration changes                                   |
| chore    | Maintenance tasks (e.g., updating configs, cleaning up files) |
| revert   | Reverts a previous commit                                     |

Example: git commit -m "docs(README): make the README.md more explicit and complete"

---

## ✅ Completed Modules

The following modules have been successfully implemented:

### Web
* **Major:** Use a framework for both the frontend and backend. -> **2 points**
  - Use a frontent framework: React
  - Use a backend framework: NestJS
* **Minor:** Use a frotend framework: React -> **1 point**
* **Minor:** Use a backend framework: NestJS -> **1 point**
* **Major:** Implement real-time features using WebSockets or similar technology. -> **2 points**
  - Real-time updates across clients.
  - Handle connection/disconnection gracefully.
  - Efficient message broadcasting.
* **Major:** A public API to teract with the database with a secured API key, rate
limiting, documentation, and at least 5 endpoints: -> **2 points**
  - GET /api/{something}
  - POST /api/{something}
  - PUT /api/{something} (sahaza)
  - DELETE /api/{something}
  - PATCH /api/{something}
* **Major:** Use an ORM for the database. -> **2 points**
* **Minor:** A complete notification system for all creation, update, and deletion actions. -> **1 point** (sahaza)
* **Minor:** Implement advanced search functionality with filters, sorting, and pagination. -> **1 point** (mihangy)

Total: 12 points

### Accessibility and Internationalization
* **Minor:** Support for multiple languages (at least 3 languages). -> **1 point** (mihangy)
  - Implement i18n (internationalization) system.
  - At least 3 complete language translations.
  - Language swicther in the UI.
  - All user-facing text must be translatable.
* **Minor:** Support for additional browsers. -> **1 point**
  - Full compatibility with at least 2 additional browsers (Firefox, Safari, Edge, etc.)
  - Test and fix all features in each browser.
  - Document any browser-specific limitations.
  - Consistent UI/UX across all supported browsers.

Total: 2 points

### User Management
* **Minor:** Implement remote authentication with OAuth 2.0 (Google, GitHub, 42, etc.). -> **1 point**
* **Major:** Advanced permissions system: -> **2 points**
  - View, edit, and delete users (CRUD). (edit a revoir Sahaza)
  - Roles management (admin, user, guest, moderator, etc.).
  - Different views and actions based on user role.
* **Minor:** User activity analytics and insights dashboard. -> **1 point**

Total: 4 points

### Data and Analytics
* **Major:** Advanced analytics dashboard with data visualization. -> **2 points**
  - Interactive charts and graphs (line, bar, pie, etc.).
  - Real-time data updates.
  - Export functionality (PDF, CSV, etc.). (sahaza)
  - Customizable date ranges and filters. (mihangy)

Total: 2 points

---

Final Total: 20 points
