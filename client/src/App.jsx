import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from './features/auth/authSlice';

import Login from './pages/Login';

import AdminDashboard from './pages/admin/AdminDashboard';
import Teachers from './pages/admin/Teachers';
import Students from './pages/admin/Students';
import Classes from './pages/admin/Classes';
import AttendanceOverview from './pages/admin/AttendanceOverview';
import FeesManager from './pages/admin/FeesManager';

import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAssignments from './pages/teacher/TeacherAssignments';
import TeacherLectures from './pages/teacher/TeacherLectures';
import TeacherNotes from './pages/teacher/TeacherNotes';
import TakeAttendance from './pages/teacher/TakeAttendance';

import StudentDashboard from './pages/student/StudentDashboard';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentLectures from './pages/student/StudentLectures';
import StudentNotes from './pages/student/StudentNotes';
import MyAttendance from './pages/student/MyAttendance';
import MyFees from './pages/student/MyFees';

import Announcements from './pages/shared/Announcements';
import Profile from './pages/shared/Profile';
import Register from './pages/Register';


// Render a component chosen by the current user's role; redirect if no match
function ByRole({ admin, teacher, student }) {
  const user = useSelector(selectCurrentUser);
  const map = { admin, teacher, student };
  const Component = user ? map[user.role] : null;
  return Component ? <Component /> : <Navigate to="/app" replace />;
}

export default function App() {
  return (
   
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: '10px', fontSize: '14px', border: '1px solid #e2e8f0' },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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
      </BrowserRouter>
  );
}
