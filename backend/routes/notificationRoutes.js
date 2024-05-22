const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const { getNotifications, createNotification, markAsRead, markAllAsRead } = require("../controller/notificationController");

router.get("/", validateToken(["admin", "project_manager", "user"]), getNotifications);
router.post("/", validateToken(["admin", "project_manager", "user"]), createNotification);
router.post("/markasRead/:id", validateToken(["admin", "project_manager", "user"]), markAsRead);
router.put("/markAllAsRead", validateToken(["admin", "project_manager", "user"]), markAllAsRead);

router.all("/", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/markasRead/:id", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/markAllAsRead", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
module.exports = router;
