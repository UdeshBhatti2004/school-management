import { noteApi } from "../../features/notes/noteApi";

export function registerNoteListeners(socket, dispatch) {
  const handleNoteCreated = () => {
    dispatch(
      noteApi.util.invalidateTags([
        { type: "Note", id: "LIST" },
      ])
    );
  };

  const handleNoteUpdated = () => {
    dispatch(
      noteApi.util.invalidateTags([
        { type: "Note", id: "LIST" },
      ])
    );
  };

  const handleNoteDeleted = () => {
    dispatch(
      noteApi.util.invalidateTags([
        { type: "Note", id: "LIST" },
      ])
    );
  };

  socket.on("note:created", handleNoteCreated);
  socket.on("note:updated", handleNoteUpdated);
  socket.on("note:deleted", handleNoteDeleted);

  return () => {
    socket.off("note:created", handleNoteCreated);
    socket.off("note:updated", handleNoteUpdated);
    socket.off("note:deleted", handleNoteDeleted);
  };
}