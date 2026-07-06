import { lectureApi } from "../../features/lectures/lectureApi";


export function registerLectureListeners(socket, dispatch) {
  const handleLectureCreated = () => {
    dispatch(
      lectureApi.util.invalidateTags([
        { type: "Lecture", id: "LIST" },
      ])
    );
  };

  const handleLectureUpdated = () => {
    dispatch(
      lectureApi.util.invalidateTags([
        { type: "Lecture", id: "LIST" },
      ])
    );
  };

  const handleLectureDeleted = () => {
    dispatch(
      lectureApi.util.invalidateTags([
        { type: "Lecture", id: "LIST" },
      ])
    );
  };

  socket.on("lecture:created", handleLectureCreated);
  socket.on("lecture:updated", handleLectureUpdated);
  socket.on("lecture:deleted", handleLectureDeleted);

  return () => {
    socket.off("lecture:created", handleLectureCreated);
    socket.off("lecture:updated", handleLectureUpdated);
    socket.off("lecture:deleted", handleLectureDeleted);
  };
}