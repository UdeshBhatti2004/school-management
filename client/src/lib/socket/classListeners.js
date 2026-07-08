import { classApi } from "../../features/classes/classApi";

export function registerClassListeners(socket, dispatch) {
  const invalidate = () => {
    dispatch(
      classApi.util.invalidateTags([
        { type: "Class", id: "LIST" },
      ])
    );
  };

  socket.on("class:created", invalidate);
  socket.on("class:updated", invalidate);
  socket.on("class:deleted", invalidate);

  return () => {
    socket.off("class:created", invalidate);
    socket.off("class:updated", invalidate);
    socket.off("class:deleted", invalidate);
  };
}