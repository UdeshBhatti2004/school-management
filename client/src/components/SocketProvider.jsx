import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectCurrentUser,
  selectToken,
} from "../features/auth/authSlice";
import { socket } from "../lib/socket";
import { assignmentApi } from "../features/assignments/assignmentApi";

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

  const handleAssignmentCreated = () => {
  console.log("📚 Assignment created");

  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Assignment", id: "LIST" },
    ])
  );
};

const handleSubmissionCreated = ({ assignmentId }) => {
  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Submission", id: assignmentId },
    ])
  );
};

socket.on("submission:created", handleSubmissionCreated);

socket.on("assignment:created", handleAssignmentCreated);

  return () => {
  socket.off("assignment:created", handleAssignmentCreated);
  socket.off("submission:created", handleSubmissionCreated);
  socket.disconnect();
};

}, [user, token]);

  return children;
}