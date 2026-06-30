import {
  LayoutDashboard, Users, GraduationCap, BookCopy, School,
  FileText, Video, Megaphone, CalendarCheck, Wallet, NotebookText,
} from 'lucide-react';

// Navigation items per role. `to` is relative to /app
export const navByRole = {
  admin: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/teachers', label: 'Teachers', icon: GraduationCap },
    { to: '/app/students', label: 'Students', icon: Users },
    { to: '/app/classes', label: 'Classes', icon: School },
    { to: '/app/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/app/fees', label: 'Fees', icon: Wallet },
    { to: '/app/announcements', label: 'Announcements', icon: Megaphone },
  ],
  teacher: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/app/assignments', label: 'Assignments', icon: FileText },
    { to: '/app/lectures', label: 'Lectures', icon: Video },
    { to: '/app/notes', label: 'Notes', icon: NotebookText },
    { to: '/app/announcements', label: 'Announcements', icon: Megaphone },
  ],
  student: [
    { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/app/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/app/assignments', label: 'Assignments', icon: BookCopy },
    { to: '/app/lectures', label: 'Lectures', icon: Video },
    { to: '/app/notes', label: 'Notes', icon: NotebookText },
    { to: '/app/fees', label: 'Fees', icon: Wallet },
    { to: '/app/announcements', label: 'Announcements', icon: Megaphone },
  ],
};

export const roleLabels = {
  admin: 'Administrator',
  teacher: 'Teacher',
  student: 'Student',
};
