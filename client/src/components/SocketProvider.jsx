import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectToken,
} from "../features/auth/authSlice";
import { socket } from "../lib/socket";
import { registerAssignmentListeners } from "../lib/socket/assignmentListeners";
import { registerAnnouncementListeners } from "../lib/socket/announcementListeners";
import { registerNoteListeners } from "../lib/socket/noteListeners";
import { registerLectureListeners } from "../lib/socket/lectureListeners";
import { registerAttendanceListeners } from "../lib/socket/attendanceListeners";


export default function SocketProvider({ children }) {
  const user = useSelector(selectCurrentUser);

  const token = useSelector(selectToken);
  const dispatch = useDispatch();

  useEffect(() => {
  if (!user || !token) {
    socket.disconnect();
    return;
  }

  socket.auth = {
    token,
  };

  socket.connect();

const cleanupAssignments = registerAssignmentListeners(
  socket,
  dispatch
);

const cleanupAnnouncements = registerAnnouncementListeners(
  socket,
  dispatch
);

const cleanupNotes = registerNoteListeners(
  socket,
  dispatch
);


const cleanupLectures = registerLectureListeners(
  socket,
  dispatch
);


const cleanupAttendance = registerAttendanceListeners(
  socket,
  dispatch
);


 return () => {
  cleanupAssignments();
  cleanupAnnouncements();
  cleanupNotes();
  cleanupLectures();
  cleanupAttendance();

  socket.disconnect();
};

}, [user, token, dispatch]);

  return children;
}