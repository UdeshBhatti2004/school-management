# 🎓 Scholora — Modern School Management System (MERN)

> **Scholora** is a production-quality School ERP built using the **MERN Stack** with a modern enterprise architecture. It provides complete school management for **Admins, Teachers, and Students**, featuring real-time synchronization, role-based authentication, Cloudinary file uploads, RTK Query, and Socket.IO.

---

## ✨ Features

### 👨‍💼 Admin

- Professional dashboard with school-wide analytics
- Manage Teachers
- Manage Students
- Manage Classes
- Assign Class Teachers
- Assign Subject Teachers
- Prevent duplicate classes
- Prevent duplicate subjects
- Manage Announcements
- Manage Assignments
- Manage Lectures
- Manage Notes & Study Materials
- View Attendance Overview
- Issue Fees to:
  - Individual Student
  - Entire Class
- Record Full & Partial Payments
- View Fee Collection Summary
- Manage User Profiles

---

### 👨‍🏫 Teacher

- Personal Dashboard
- View Assigned Classes
- Take Attendance
- Edit Existing Attendance
- Create Assignments
- Edit Assignments
- Delete Assignments
- View Student Submissions
- Grade Assignments
- Provide Feedback
- Publish Video Lectures
- Upload Lecture Videos (Cloudinary)
- Share YouTube/Vimeo Links
- Edit/Delete Lectures
- Upload Notes & Study Materials
- Upload PDFs, Images & Documents
- Edit/Delete Notes
- Post Announcements
- Manage Profile

---

### 👨‍🎓 Student

- Personal Dashboard
- View Assignments
- Submit Assignments
- Resubmit Assignments (until graded)
- View Grades & Feedback
- Watch Video Lectures
- View Notes & Study Materials
- Download Shared Materials
- View Attendance History
- View Attendance Percentage
- View Fee Records
- View Payment History
- View Outstanding Fees
- Manage Profile

---

# 🚀 Production Features

- ✅ JWT Authentication
- ✅ Role-Based Authorization
- ✅ Multi-School Architecture
- ✅ RTK Query Data Layer
- ✅ Socket.IO Realtime Updates
- ✅ Cloudinary File Uploads
- ✅ Responsive UI
- ✅ Professional Dashboard
- ✅ Enterprise Business Rules
- ✅ Audit Information
- ✅ Modern UI Components
- ✅ Tailwind CSS
- ✅ Framer Motion Animations

---

# ⚡ Realtime Architecture

Scholora follows a centralized realtime architecture.

```
Controller
      │
      ▼
Socket.IO Emit
      │
      ▼
SocketProvider
      │
      ▼
Module Listener
      │
      ▼
RTK Query invalidateTags()
      │
      ▼
Automatic Refetch
      │
      ▼
Updated UI
```

Socket.IO is implemented for:

- Assignments
- Announcements
- Notes
- Lectures
- Attendance
- Classes
- Fees

---

# 🏗️ Business Rules

## Authentication

- JWT Authentication
- Role-Based Authorization
- School-Based Data Isolation

---

## Classes

- One Class Teacher per Class
- One Teacher cannot be Class Teacher of multiple Classes
- Duplicate Classes prevented
- Duplicate Subjects prevented
- Subject Teachers validated
- Cannot delete Class containing Students

---

## Attendance

- Attendance belongs to:
  - Class
  - Date

- Only Class Teacher can mark Attendance

- Attendance can be edited

- Audit information maintained

- Duplicate students prevented

- Invalid attendance statuses rejected

---

## Assignments

- Teachers create assignments
- Students submit work
- Students may resubmit until graded
- Marks validated
- Feedback supported

---

## Lectures

Supports

- YouTube
- Vimeo
- Uploaded Videos

Automatic Cloudinary cleanup on delete.

---

## Notes

Supports

- PDF
- Images
- Documents
- External Links

Automatic Cloudinary cleanup.

---

## Fees

Supports

- Individual Student Fees
- Whole Class Fee Issuing
- Partial Payments
- Payment History
- Outstanding Balance
- Collection Summary

Business Rules

- Cannot overpay
- Paid Fees cannot be edited
- Paid Fees cannot be paid again
- Fees with payments cannot be deleted

---

# 🛠️ Tech Stack

## Frontend

- React 18
- Vite
- React Router
- Redux Toolkit
- RTK Query
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- Axios
- React Hot Toast
- Lucide React

---

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs
- Socket.IO
- Cloudinary
- Express Async Handler

---

## Database

- MongoDB Atlas

---

# 📁 Project Structure

```
school-management/

├── client
│   ├── src
│   │   ├── app
│   │   ├── components
│   │   ├── features
│   │   │   ├── assignments
│   │   │   ├── attendance
│   │   │   ├── announcements
│   │   │   ├── classes
│   │   │   ├── fees
│   │   │   ├── lectures
│   │   │   ├── notes
│   │   │   ├── users
│   │   │   └── auth
│   │   ├── pages
│   │   ├── redux
│   │   ├── socket
│   │   │   ├── listeners
│   │   │   └── SocketProvider.jsx
│   │   └── utils
│
├── server
│   ├── config
│   ├── controllers
│   ├── middleware
│   ├── models
│   ├── routes
│   ├── socket
│   ├── utils
│   └── server.js
```

---

# 📡 REST API

## Authentication

```
POST   /api/auth/login
POST   /api/auth/register
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/password
```

---

## Users

```
GET    /api/users
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
GET    /api/users/stats/overview
```

---

## Classes

```
GET    /api/classes
GET    /api/classes/:id
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id
```

---

## Attendance

```
POST   /api/attendance
GET    /api/attendance
GET    /api/attendance/me
GET    /api/attendance/summary
```

---

## Assignments

```
GET    /api/assignments
POST   /api/assignments
PUT    /api/assignments/:id
DELETE /api/assignments/:id

POST   /api/assignments/:id/submit
GET    /api/assignments/:id/submissions
PUT    /api/submissions/:id/grade
```

---

## Lectures

```
GET    /api/lectures
POST   /api/lectures
PUT    /api/lectures/:id
DELETE /api/lectures/:id
```

---

## Notes

```
GET    /api/notes
POST   /api/notes
PUT    /api/notes/:id
DELETE /api/notes/:id
```

---

## Fees

```
GET    /api/fees
GET    /api/fees/summary

POST   /api/fees

PUT    /api/fees/:id
PUT    /api/fees/:id/pay

DELETE /api/fees/:id
```

---

## Announcements

```
GET    /api/announcements
POST   /api/announcements
PUT    /api/announcements/:id
DELETE /api/announcements/:id
```

---

## Uploads

```
POST /api/upload
```

---

# ☁️ File Uploads

Teachers can upload:

- Lecture Videos
- PDFs
- Images
- Documents

Uploads are stored securely using **Cloudinary**.

If Cloudinary is not configured, the application gracefully falls back to link-based resources.

---

# 🔐 Authentication

- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes
- Role-Based Authorization
- Multi-School Data Isolation

---

# ⚙️ Environment Variables

```env
PORT=5000

NODE_ENV=development

MONGO_URI=

JWT_SECRET=

JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=

CLOUDINARY_API_KEY=

CLOUDINARY_API_SECRET=
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/your-username/scholora.git

cd scholora
```

---

## Backend

```bash
cd server

npm install

npm run seed

npm run dev
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

## Demo Accounts

| Role | Email |
|------|-------|
| Admin | admin@school.edu |
| Teacher | teacher@school.edu |
| Student | student@school.edu |

Password

```
password123
```

---

# 📈 Current Modules

- ✅ Authentication
- ✅ Dashboard
- ✅ Users
- ✅ Classes
- ✅ Attendance
- ✅ Assignments
- ✅ Lectures
- ✅ Notes
- ✅ Announcements
- ✅ Fees
- 🚧 Examinations (Upcoming)
- 🚧 Timetable (Upcoming)
- 🚧 Leave Management (Upcoming)
- 🚧 Library (Upcoming)

---

# 🎯 Future Enhancements

- Online Fee Payment Gateway
- Receipt Generation
- Examination & Result Management
- Timetable Generator
- Leave Management
- Library Management
- Transport Management
- Inventory Management
- Parent Portal
- Mobile Application
- Notifications
- Email & SMS Integration
- Report Card Generation
- Analytics Dashboard

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Udesh Bhatti**

Built with ❤️ using the MERN Stack.