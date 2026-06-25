
# The Pass — Dish Dashboard

A MERN-stack app for managing a restaurant's dish list: a Node/Express/MongoDB
API, and a React dashboard that toggles a dish's published status and stays
live-synced with the database in real time — including changes made directly
on the backend, outside the dashboard.

## Stack

- **MongoDB** + **Mongoose** — data store and schema
- **Express** — REST API
- **Socket.IO** — pushes live updates to every connected dashboard
- **React (Vite)** — dashboard UI


## Data model

```js
{
  dishId: String,      // unique, e.g. "D001"
  dishName: String,
  imageUrl: String,
  isPublished: Boolean,
  createdAt, updatedAt // added automatically by Mongoose timestamps
}
```
## Setup

cd server && npm install
cd ../client && npm install

cp server/.env.example server/.env
cp client/.env.example client/.env


## Seed the database

npm run seed
# or: cd server && npm run seed

cd server && npm run dev      # API on http://localhost:4000
cd client && npm run dev      # Dashboard on http://localhost:5173
```

Open **http://localhost:5173**.

## Demonstrating the bonus (real-time backend sync)

To prove the dashboard reacts to changes made *outside* the dashboard, with
the app running, open a second terminal and flip a dish directly in the
database — bypassing the API and the UI entirely:

```bash
mongosh dish-dashboard --eval '
  db.dishes.updateOne(
    { dishId: "D003" },
    { $set: { isPublished: true } }
  )
'


