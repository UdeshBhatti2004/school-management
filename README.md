# Scholora — School Management System (MERN)

A full-stack school management application with three roles — **Admin**, **Teacher**, and **Student** — built with **MongoDB, Express, React, Node.js**, styled with **Tailwind CSS**, and animated with **Framer Motion**.

## Features

**Admin**
- Dashboard with school-wide stats (teachers, students, classes, fees outstanding, lectures)
- Manage teachers (departments, subjects, employee IDs)
- Manage students (roll numbers, class assignment, guardian details)
- Create and manage classes, assign class teachers and subject teachers, view rosters
- **Attendance overview** — per-student attendance percentages by class
- **Fees** — issue fees to a student or a whole class, record full/partial payments, track collection (billed / collected / outstanding)
- Post announcements to the whole school, teachers, students, or a specific class

**Teacher**
- Personal dashboard with upcoming due dates
- **Take attendance** — mark present / late / absent per class and date, prefilled from any existing sheet
- Create assignments for classes; view and grade student submissions with feedback
- Publish video lectures (YouTube / Vimeo link, **or upload a video file via Cloudinary**)
- **Notes & materials** — upload PDFs/docs/images (Cloudinary) or share links
- Post announcements

**Student**
- Dashboard showing pending work, grades, and latest lectures
- View and submit assignments (text + link), resubmit until graded, see marks & feedback
- Watch lectures (embedded or uploaded) shared with their class
- **My attendance** — attendance percentage and full history
- **My fees** — outstanding dues, paid history, and statuses
- **Notes** — view and download materials shared with their class

**Across the app**
- JWT authentication with role-based access control on every route
- File uploads to Cloudinary (videos, notes) with graceful fallback to links when not configured
- Profile management and password change
- Professional, responsive UI with subtle motion (respects `prefers-reduced-motion`)

## Tech stack

| Layer    | Tech                                                       |
|----------|------------------------------------------------------------|
| Frontend | React 18, Vite, React Router, Tailwind CSS, Framer Motion, Axios, lucide-react, react-hot-toast |
| Backend  | Node.js, Express, Mongoose, JSON Web Tokens, bcryptjs      |
| Database | MongoDB (local or Atlas)                                   |

## Project structure

```
school-management/
├── server/                 # Express API
│   ├── config/db.js        # Mongo connection
│   ├── models/             # User, ClassRoom, Assignment, Submission, Lecture, Announcement
│   ├── middleware/         # auth (protect + authorize), error handling
│   ├── controllers/        # business logic
│   ├── routes/             # REST endpoints
│   ├── seed.js             # demo data + accounts
│   └── server.js           # entry point
└── client/                 # React app
    └── src/
        ├── api/client.js       # axios instance w/ token interceptor
        ├── context/            # AuthContext
        ├── components/         # layout + UI primitives
        ├── lib/                # helpers, nav config, useFetch
        └── pages/              # admin / teacher / student / shared
```

## Getting started

### Prerequisites
- Node.js 18+
- MongoDB running locally, **or** a MongoDB Atlas connection string

### 1. Backend

```bash
cd server
npm install
cp .env.example .env        # then edit .env (set MONGO_URI and JWT_SECRET)
npm run seed                # creates demo accounts + sample data
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend (in a second terminal)

```bash
cd client
npm install
npm run dev                 # starts app on http://localhost:5173
```

The Vite dev server proxies `/api` to the backend automatically, so no extra config is needed in development.

### 3. Sign in

Open http://localhost:5173 and use one of the seeded demo accounts (all use password **`password123`**). The login screen has one-tap buttons to fill each:

| Role    | Email                |
|---------|----------------------|
| Admin   | admin@school.edu     |
| Teacher | teacher@school.edu   |
| Student | student@school.edu   |

## Environment variables (`server/.env`)

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/school_management
JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional — enables file uploads for lectures and notes.
# Without these, the app still works; teachers just paste links instead.
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### Enabling file uploads (Cloudinary)

1. Create a free account at **cloudinary.com** and open the **Dashboard**.
2. Copy your **Cloud name**, **API Key**, and **API Secret** into the three `CLOUDINARY_*` variables above.
3. Restart the server. Teachers will now see an **Upload** option for lecture videos and notes; without the keys those toggles return a clear "uploads not configured" message and links keep working.

> Note: Cloudinary's free tier has size/bandwidth limits that are fine for development. For large video at scale you'd move to dedicated video storage, but the upload flow and database fields are already in place.

## API overview

| Method | Endpoint                          | Access            | Purpose                         |
|--------|-----------------------------------|-------------------|---------------------------------|
| POST   | `/api/auth/login`                 | public            | Sign in                         |
| GET    | `/api/auth/me`                    | any               | Current user                    |
| PUT    | `/api/auth/profile` `/password`   | any               | Update profile / password       |
| GET/POST | `/api/users`                    | admin             | List / create users             |
| PUT/DELETE | `/api/users/:id`              | admin             | Update / delete user            |
| GET    | `/api/users/stats/overview`       | admin             | Dashboard counts                |
| GET/POST | `/api/classes`                  | read: any, write: admin | Classes                   |
| GET/POST | `/api/assignments`              | role-scoped       | List / create assignments       |
| POST   | `/api/assignments/:id/submit`     | student           | Submit work                     |
| GET    | `/api/assignments/:id/submissions`| teacher/admin     | View submissions                |
| PUT    | `/api/submissions/:id/grade`      | teacher/admin     | Grade a submission              |
| GET/POST | `/api/lectures`                 | role-scoped       | List / create lectures          |
| GET/POST | `/api/notes`                    | role-scoped       | List / create notes & materials |
| POST   | `/api/attendance`                 | teacher/admin     | Mark attendance (upsert)        |
| GET    | `/api/attendance/me`              | student           | Own attendance + summary        |
| GET    | `/api/attendance/summary`         | admin/teacher     | Per-student % for a class       |
| GET/POST | `/api/fees`                     | role-scoped       | List / issue fees               |
| PUT    | `/api/fees/:id/pay`               | admin             | Record a payment                |
| POST   | `/api/upload`                     | teacher/admin     | Upload a file to Cloudinary     |
| GET/POST | `/api/announcements`            | role-scoped       | List / create announcements     |

## Building for production

```bash
cd client && npm run build      # outputs static files to client/dist
```

Serve `client/dist` from any static host (or from Express) and point it at the deployed API. Remember to set `NODE_ENV=production`, a strong `JWT_SECRET`, and the correct `CLIENT_URL` on the server.

## Notes & extension ideas

- **Video uploads:** lectures currently use links (embeds for YouTube/Vimeo). The `Lecture` model already has a `sourceType: 'upload'` field and the server serves `/uploads` statically — wire up `multer` (already a dependency) to accept file uploads when you need them.
- **Attendance, timetable, fees:** the model layer is structured to extend — add a model, a controller, a route, and a page following the existing patterns.
- Passwords are hashed with bcrypt; tokens are stored client-side in `localStorage` and sent as `Bearer` tokens.
