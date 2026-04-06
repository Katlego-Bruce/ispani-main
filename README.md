# ISPANI BACKEND 🚀

## Overview

Ispani is a community-driven job marketplace designed to connect local workers with nearby opportunities. This backend powers user management, job posting, and matching functionality.

---

## 🎯 Current Stage (MVP)

This project is currently focused on a **Minimum Viable Product (MVP)** with the following core features:

* User registration (phone-based)
* Job posting
* Job browsing
* Basic matching (skills + location)

---

## 🛠 Tech Stack

* Node.js
* Express.js
* PostgreSQL
* Prisma ORM
* dotenv

---

## 📁 Project Structure

```
src/
 ├── modules/
 │    ├── users/
 │    ├── jobs/
 │    ├── applications/
 │
 ├── config/
 ├── services/
 ├── middleware/
 ├── server.js
```

---

## 🚀 Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Setup environment variables

Create a `.env` file:

```
DATABASE_URL="your_database_url"
PORT=3000
```

### 3. Setup database

```
npx prisma migrate dev
```

### 4. Run server

```
npm run dev
```

Server will run on:

```
http://localhost:3000
```

---

## 📦 API (Initial)

### Users

* POST `/users/register`
* POST `/users/login`

### Jobs

* POST `/jobs`
* GET `/jobs`

---

## 🔥 Vision

Ispani is not just a job marketplace.

It is being built into a **community economic engine** that:

* Keeps money within local communities
* Promotes fair work and pricing
* Empowers informal workers

---

## 🤖 Future Enhancements (AI Layer)

* Smart job-worker matching
* Fair price recommendations
* Fraud detection
* Multilingual support (isiZulu, English, etc.)

---

## ⚠️ Notes

This project is under active development. Structure and features will evolve as the platform grows.

---

## 💡 Next Steps

* Build user authentication
* Implement job posting API
* Add database relationships
* Deploy backend

---

## 👨‍💻 Author

Katlego Ramokgadi
