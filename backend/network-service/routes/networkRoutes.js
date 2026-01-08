const express = require("express");
const router = express.Router();
const {
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  removeConnection,
  getMyConnections,
  getPendingRequests,
  getSentRequests,
  getConnectionSuggestions,
  deleteUserConnections,
} = require("../controllers/networkController");
const { protect } = require("../middleware/auth");

router.post("/connect/:userId", protect, sendConnectionRequest);
router.put("/accept/:connectionId", protect, acceptConnectionRequest);
router.put("/reject/:connectionId", protect, rejectConnectionRequest);
router.delete("/remove/:connectionId", protect, removeConnection);
router.get("/connections", protect, getMyConnections);
router.get("/requests/pending", protect, getPendingRequests);
router.get("/requests/sent", protect, getSentRequests);
router.get("/suggestions", protect, getConnectionSuggestions);
router.delete("/user/:userId", protect, deleteUserConnections);

module.exports = router;
