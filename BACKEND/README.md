# DeepStore Backend

RESTful MERN backend for the DeepStore e-commerce application.
Serves the React frontend at `/api/v1` and is the source of truth for users,
products, categories, carts, orders, inventory, and administration.

**Stack:** Node.js · Express · MongoDB · Mongoose · JWT · Zod · Swagger

---

## Quick Start

### Prerequisites

- **Node.js 20+** — check with `node -v`
- **npm** — check with `npm -v`
- A **MongoDB Atlas** connection string (or local MongoDB running)

### Setup

```bash
# 1. Clone
git clone <repo-url>
cd deepstore-backend

# 2. Install
npm install

# 3. Create your .env
cp .env.example .env       # Git Bash / Mac / Linux
copy .env.example .env     # Windows cmd

# 4. Edit .env — fill in real values (see Environment Variables below)

# 5. Run
npm run dev