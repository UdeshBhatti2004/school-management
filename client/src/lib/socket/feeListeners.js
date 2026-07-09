import { feeApi } from "../../features/fees/feeApi";

export function registerFeeListeners(socket, dispatch) {
  const invalidateFees = () => {
    dispatch(
  feeApi.util.invalidateTags([
    { type: "Fee", id: "LIST" },
    { type: "Fee", id: "SUMMARY" },
  ])
);
  };

  socket.on("fee:created", invalidateFees);
  socket.on("fee:updated", invalidateFees);
  socket.on("fee:deleted", invalidateFees);
  socket.on("fee:paymentRecorded", invalidateFees);

  return () => {
    socket.off("fee:created", invalidateFees);
    socket.off("fee:updated", invalidateFees);
    socket.off("fee:deleted", invalidateFees);
    socket.off("fee:paymentRecorded", invalidateFees);
  };
}