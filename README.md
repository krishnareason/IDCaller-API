# 📞 IDCaller API

A robust backend REST API for a caller ID and spam reporting service, built with **Node.js**, **Express**, and **Prisma**.  
This API supports user authentication, contact management, spam reporting, and advanced search capabilities to identify unknown numbers.

---

## ✨ Features

- **User Authentication:** Secure user registration and login using JWT (JSON Web Tokens).
- **Password Security:** Passwords are hashed using bcrypt (never stored in plaintext).
- **Protected Routes:** All critical endpoints require a valid JWT.
- **Contact Management:** Users can add and manage their personal contact lists.
- **Spam Reporting:** Any number can be marked as spam to contribute to a global spam score.
- **Advanced Search by Name:**
  - Search for users by name.
  - Results prioritized by names starting with the query.
- **Intelligent Search by Number:**
  - Returns profile if number is registered.
  - Searches the global contact list otherwise.
- **Privacy Control:** User emails are only visible if they are in your contact list.
- **Database Seeding:** Comes with a script to populate the database with mock data.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** PostgreSQL  
- **ORM:** Prisma  
- **Authentication:** JSON Web Tokens (JWT), bcrypt  
- **Dev Tools:** Nodemon  

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or later)  
- PostgreSQL installed and running  
- API client like Postman or Insomnia  

---

### 📦 Installation & Setup

1. **Clone the repository:**

```bash
git clone https://github.com/krishnareason/IDCaller-API.git
cd IDCaller-API

---

2. Install dependencies:
npm install

---

3. Create environment file:
#Create .env file 
# PostgreSQL connection string
DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/idcaller_db?schema=public"

# JWT secret key
JWT_SECRET="YOUR_SUPER_SECRET_JWT_KEY"

---

4. Run database migrations:
npx prisma migrate dev

---

5. Seed the database:
npx prisma db seed

---

6. Start the development server:
npm run dev

```bash