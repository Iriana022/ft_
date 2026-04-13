
---

# Tikeo - ft_transcendence

Tikeo is our ft_transcendence project at 42: a real-time support ticket platform with role-based workflows for clients, agents, and admins.

The product goal is simple: make support handling fast, traceable, and collaborative.

![Tikeo preview](kermit.png)

## Table of Contents

1. [Overview](#overview)
2. [Roles and Main Flows](#roles-and-main-flows)
3. [Evaluation Scope](#evaluation-scope)
4. [Tech Stack](#tech-stack)
5. [Project Architecture](#project-architecture)
6. [Quick Start (Docker)](#quick-start-docker)
7. [Environment Variables](#environment-variables)
8. [Developer Guide](#developer-guide)
9. [Quality and Security Notes](#quality-and-security-notes)
10. [Team](#team)
11. [Commit Convention](#commit-convention)

## Overview

Tikeo centralizes support operations:

- Clients create and track tickets.
- Agents process tickets and communicate with clients.
- Admins manage users, moderation, and global platform oversight.

Core product capabilities:

- Real-time ticket updates and notifications.
- Role-based permissions and dedicated interfaces.
- Ticket lifecycle management (open, in progress, resolved, closed).
- Chat-driven collaboration between users and support.
- Analytics dashboards and export features.
- Multilingual user experience (French, English, Spanish).

## Roles and Main Flows

### Client

- Creates support tickets.
- Tracks ticket progress in real time.
- Chats with the assigned support team.

### Agent

- Sees incoming tickets and priorities.
- Updates ticket status and follows SLA flow.
- Responds to clients in ticket chat.

### Admin

- Full visibility across users and tickets.
- User CRUD and role governance.
- Global moderation and analytics.


## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite (rolldown-vite)
- Tailwind CSS + DaisyUI
- React Router
- i18next / react-i18next
- Socket.IO client
- Recharts + jsPDF for analytics/export

### Backend

- NestJS 11 + TypeScript
- Prisma ORM
- PostgreSQL 15
- JWT authentication
- OAuth2 (Google)
- WebSocket gateway (Socket.IO)
- Throttling / rate limiting

### Infrastructure

- Docker + Docker Compose
- Nginx gateway (HTTP/HTTPS)

## Project Architecture

```text
ft_transcendence/
|- frontend/   (React UI)
|- backend/    (NestJS API + WebSocket)
|- nginx/      (reverse proxy + TLS)
|- docker-compose.yml
|- Makefile
```

Runtime topology:

- frontend -> nginx (8443)
- nginx -> backend API
- backend -> postgres
- socket events for live ticket updates and notifications

## Quick Start (Docker)

Prerequisites:

- Docker
- Docker Compose
- Linux environment (recommended)

Start everything:

```bash
git clone https://github.com/Iriana022/ft_ ft_transcendence
touch .env
#Fill in the .env file with the information in the next section
make

Open in browser:

- https://localhost:8443

Useful lifecycle commands:

```bash
make up         # start existing containers
make down       # stop containers
make re         # full clean + rebuild
make prisma-studio
```

## Environment Variables


Define these information in your .env file at least before starting the project:

- `DATABASE_URL`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `ADMIN_LOGIN`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## Developer Guide


### API and real-time development notes

- REST API handles CRUD and auth workflows.
- Socket events propagate ticket and notification updates.
- Role-based guards enforce access control by user role.

## Quality and Security Notes

- JWT-based authentication.
- Role-based authorization guards.
- Rate limiting enabled in backend.
- HTTPS termination through Nginx gateway.
- Prisma schema-managed data model.
- Privacy Policy and Terms of Service pages are integrated in the frontend and accessible from footer links.

## Team

- Product Owner (PO) & Developer: Mihangy (pmihangy)
- Product Manager (PM) / Scrum Master & Developer: Sahaza (srasolom)
- Technical Lead / Architect & Developer: Iriana (irazafim)
- Developer: Finaritra (vmpianim)

## Commit Convention

| Type | Description |
| --- | --- |
| feat | New feature |
| fix | Bug fix |
| docs | Documentation updates |
| style | Formatting or styling-only changes |
| refactor | Internal code refactor without feature change |
| perf | Performance improvements |
| test | Test additions/updates |
| build | Build/dependency/config updates |
| ci | CI/CD workflow changes |
| chore | Maintenance tasks |
| revert | Revert previous commit |


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
* **Major:** A public API to interact with the database with a secured API key, rate
limiting, documentation, and at least 5 endpoints: -> **2 points**
  - GET /api/{something}
  - POST /api/{something}
  - PUT /api/{something} (sahaza)
  - DELETE /api/{something}
* **Major:** Use an ORM for the database. -> **2 points**
* **Minor:** A complete notification system for all creation, update, and deletion actions. -> **1 point** (sahaza)
* **Minor:** Implement advanced search functionality with filters, sorting, and pagination. -> **1 point** (mihangy)

Total: 12 points

### Accessibility and Internationalization
* **Minor:** Support for multiple languages (at least 3 languages). -> **1 point**
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

Final Total: 20 points
---

## Evaluation Scope

The project scope prepared for evaluation includes the implemented modules below.

| Category | Implemented scope |
| --- | --- |
| Web | Frontend + backend frameworks, real-time features (WebSocket), public API, ORM integration, notifications, advanced search/filter/sort/pagination |
| Accessibility and i18n | 3 languages with full i18n flow, browser compatibility efforts |
| User management | OAuth2 integration, advanced permission system, user analytics |
| Data and analytics | Dashboard with visualizations, filters, exports |

Target scope: 20 points.