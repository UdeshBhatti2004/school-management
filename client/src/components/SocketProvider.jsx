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

  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Assignment", id: "LIST" },
    ])
  );
};

socket.on("assignment:created", handleAssignmentCreated);

const handleSubmissionCreated = ({ assignmentId }) => {
  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Submission", id: assignmentId },
    ])
  );
};

socket.on("submission:created", handleSubmissionCreated);



const handleSubmissionGraded = () => {
  console.log("✅ submission:graded received");
  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Assignment", id: "LIST" },
    ])
  );
};

socket.on("submission:graded", handleSubmissionGraded);


const handleAssignmentDeleted = () => {
  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Assignment", id: "LIST" },
    ])
  );
};

socket.on("assignment:deleted", handleAssignmentDeleted);


const handleAssignmentUpdated = () => {
  dispatch(
    assignmentApi.util.invalidateTags([
      { type: "Assignment", id: "LIST" },
    ])
  );
};


socket.on("assignment:updated", handleAssignmentUpdated);


  return () => {
  socket.off("assignment:created", handleAssignmentCreated);
  socket.off("submission:created", handleSubmissionCreated);
  socket.off("submission:graded", handleSubmissionGraded);
  socket.off("assignment:deleted", handleAssignmentDeleted);
  socket.off("assignment:updated", handleAssignmentUpdated);
  socket.disconnect();
};

}, [user, token]);

  return children;
}