import { attendanceApi } from "../../features/attendance/attendanceApi";

export function registerAttendanceListeners(socket, dispatch) {
  const handleAttendanceMarked = () => {
    dispatch(
      attendanceApi.util.invalidateTags([
        "Attendance",
      ])
    );
  };

  socket.on("attendance:marked", handleAttendanceMarked);

  return () => {
    socket.off("attendance:marked", handleAttendanceMarked);
  };
}