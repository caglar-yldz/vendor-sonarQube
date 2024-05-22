const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const paginatedResults = require("../pagination/pagination");
const Effort = require("../models/effortModel");
const {createEffort,updateEffort,getEfforts,addComment,getComments,approveEffort, getVendorsAllEfforts, singlecreateEffort, createMultipleEfforts} = require("../controller/effortController");



router.post("/createEffort",validateToken(["admin","user", "project_manager"]),createEffort);
router.put("/updateEffort/:id",validateToken(["admin","user", "project_manager"]),updateEffort);
router.get("/getEfforts/:id",validateToken(["admin","user", "project_manager"]),paginatedResults(Effort),getEfforts);
router.post("/addComment",validateToken(["admin","user", "project_manager"]),addComment);
router.get("/getComments/:id",validateToken(["admin","user", "project_manager"]),getComments)
router.get("/getVendorsAllEfforts",validateToken(["admin","user"]),getVendorsAllEfforts)
router.put("/status",validateToken(["admin","user"]),approveEffort);
router.post("/singlecreateEffort",validateToken(["admin","user", "project_manager"]),singlecreateEffort);
router.post("/createMultipleEfforts",validateToken(["admin","user", "project_manager"]),createMultipleEfforts);

router.all("/createEffort", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/updateEffort/:id", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/getEfforts/:id", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/addComment", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/getComments/:id", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/getVendorsAllEfforts", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/status", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/singlecreateEffort", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });
  router.all("/createMultipleEfforts", (req, res) => {
    res.status(405).send("Method Not Allowed");
  });  
module.exports = router;