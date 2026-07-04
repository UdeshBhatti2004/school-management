import { announcementApi } from "../../features/announcements/announcementApi";

export function registerAnnouncementListeners(socket, dispatch) {
  const handleAnnouncementCreated = () => {
    dispatch(
      announcementApi.util.invalidateTags([
        { type: "Announcement", id: "LIST" },
      ])
    );
  };

  const handleAnnouncementUpdated = () => {
    dispatch(
      announcementApi.util.invalidateTags([
        { type: "Announcement", id: "LIST" },
      ])
    );
  };

  const handleAnnouncementDeleted = () => {
    dispatch(
      announcementApi.util.invalidateTags([
        { type: "Announcement", id: "LIST" },
      ])
    );
  };

  socket.on("announcement:created", handleAnnouncementCreated);
  socket.on("announcement:updated", handleAnnouncementUpdated);
  socket.on("announcement:deleted", handleAnnouncementDeleted);

  return () => {
    socket.off("announcement:created", handleAnnouncementCreated);
    socket.off("announcement:updated", handleAnnouncementUpdated);
    socket.off("announcement:deleted", handleAnnouncementDeleted);
  };
}