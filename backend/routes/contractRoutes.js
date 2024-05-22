const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateTokenHandler");
const {
  getContract,
  getContractById,
  createContract,
  sendContractToVendor,
  contractConfirmation,
  createContractPDF,
  getPendingContracts,
  getContractCount,
  payContract,
  getContractCreatedDate
} = require("../controller/contractController");

const methodNotAllowed = (req, res, next) => {
  res.status(405).send('Method Not Allowed');
};

router.get("/", validateToken(["admin", "user"]), getContract);
router.get("/count", validateToken(["admin", "user"]), getContractCount);
router.post("/send/:id", validateToken(["admin"]), sendContractToVendor);
router.post("/confirmation/:id", validateToken(["user"]), contractConfirmation);
router.get("/pending", validateToken(["admin", "user"]), getPendingContracts);
router.get("/:id", validateToken(["admin", "user"]), getContractById);
router.post("/", validateToken(["admin"]), createContract);
router.post("/contractPDF", validateToken(["admin"]), createContractPDF);
router.put("/:id", validateToken(["admin"]), payContract);
router.get("/date/:id", validateToken(["user"]), getContractCreatedDate);

router.all("/", methodNotAllowed);
router.all("/count", methodNotAllowed);
router.all("/send/:id", methodNotAllowed);
router.all("/confirmation/:id", methodNotAllowed);
router.all("/pending", methodNotAllowed);
router.all("/:id", methodNotAllowed);
router.all("/date/:id", methodNotAllowed);

module.exports = router;
