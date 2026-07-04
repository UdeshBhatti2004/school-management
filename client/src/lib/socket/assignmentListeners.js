import { assignmentApi } from "../../features/assignments/assignmentApi";

export function registerAssignmentListeners(socket, dispatch) {
  const handleAssignmentCreated = () => {
    dispatch(
      assignmentApi.util.invalidateTags([
        { type: "Assignment", id: "LIST" },
      ])
    );
  };

  const handleAssignmentUpdated = () => {
    dispatch(
      assignmentApi.util.invalidateTags([
        { type: "Assignment", id: "LIST" },
      ])
    );
  };

  const handleAssignmentDeleted = () => {
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

  const handleSubmissionGraded = () => {
    dispatch(
      assignmentApi.util.invalidateTags([
        { type: "Assignment", id: "LIST" },
      ])
    );
  };

  socket.on("assignment:created", handleAssignmentCreated);
  socket.on("assignment:updated", handleAssignmentUpdated);
  socket.on("assignment:deleted", handleAssignmentDeleted);
  socket.on("submission:created", handleSubmissionCreated);
  socket.on("submission:graded", handleSubmissionGraded);

  return () => {
    socket.off("assignment:created", handleAssignmentCreated);
    socket.off("assignment:updated", handleAssignmentUpdated);
    socket.off("assignment:deleted", handleAssignmentDeleted);
    socket.off("submission:created", handleSubmissionCreated);
    socket.off("submission:graded", handleSubmissionGraded);
  };
}