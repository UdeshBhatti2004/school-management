import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './features/auth/authSlice';
import { Spinner } from './components/ui/primitives';

import Login from './pages/Login';
import Register from './pages/Register';
import SocketProvider from './components/SocketProvider';
import SchoolAccess from "./pages/SchoolAccess";

// Route-level code splitting: each dashboard page becomes its own chunk,
// loaded only when a user with that role actually navigates to it.
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const Teachers = lazy(() => import('./pages/admin/Teachers'));
const Students = lazy(() => import('./pages/admin/Students'));
const Classes = lazy(() => import('./pages/admin/Classes'));
const AttendanceOverview = lazy(() => import('./pages/admin/AttendanceOverview'));
const FeesManager = lazy(() => import('./pages/admin/FeesManager'));

const TeacherDashboard = lazy(() => import('./pages/teacher/TeacherDashboard'));
const TeacherAssignments = lazy(() => import('./pages/teacher/TeacherAssignments'));
const TeacherLectures = lazy(() => import('./pages/teacher/TeacherLectures'));
const TeacherNotes = lazy(() => import('./pages/teacher/TeacherNotes'));
const TakeAttendance = lazy(() => import('./pages/teacher/TakeAttendance'));

const StudentDashboard = lazy(() => import('./pages/student/StudentDashboard'));
const StudentAssignments = lazy(() => import('./pages/student/StudentAssignments'));
const StudentLectures = lazy(() => import('./pages/student/StudentLectures'));
const StudentNotes = lazy(() => import('./pages/student/StudentNotes'));
const MyAttendance = lazy(() => import('./pages/student/MyAttendance'));
const MyFees = lazy(() => import('./pages/student/MyFees'));

const Announcements = lazy(() => import('./pages/shared/Announcements'));
const Profile = lazy(() => import('./pages/shared/Profile'));

function PageFallback() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

// Render a component chosen by the current user's role; redirect if no match
function ByRole({ admin, teacher, student }) {
  const user = useSelector(selectCurrentUser);
  const map = { admin, teacher, student };
  const Component = user ? map[user.role] : null;
  return Component ? <Component /> : <Navigate to="/app" replace />;
}

export default function App() {
  return (
   

     <SocketProvider>

      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', fontSize: '14px', border: '1px solid #e2e8f0' },
          }}
        />
        <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
             <Route path="/school-access" element={<SchoolAccess />} />

          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Role home */}
            <Route
              index
              element={<ByRole admin={AdminDashboard} teacher={TeacherDashboard} student={StudentDashboard} />}
            />

            {/* Admin */}
            <Route path="teachers" element={<ProtectedRoute roles={['admin']}><Teachers /></ProtectedRoute>} />
            <Route path="students" element={<ProtectedRoute roles={['admin']}><Students /></ProtectedRoute>} />
            <Route path="classes" element={<ProtectedRoute roles={['admin']}><Classes /></ProtectedRoute>} />

            {/* Role-shared paths, different components */}
            <Route path="attendance" element={<ByRole admin={AttendanceOverview} teacher={TakeAttendance} student={MyAttendance} />} />
            <Route path="fees" element={<ByRole admin={FeesManager} student={MyFees} />} />
            <Route path="assignments" element={<ByRole teacher={TeacherAssignments} student={StudentAssignments} />} />
            <Route path="lectures" element={<ByRole teacher={TeacherLectures} student={StudentLectures} />} />
            <Route path="notes" element={<ByRole teacher={TeacherNotes} student={StudentNotes} />} />

            {/* Shared */}
            <Route path="announcements" element={<Announcements />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
      </SocketProvider>

  );
}
