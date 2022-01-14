const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { noteController } = require("../controllers");

router.route("/").post(authMiddleware, noteController.createNote);

router
  .route("/:customer_id")
  .get(authMiddleware, noteController.getAllCustomerNotes);

router
  .route("/:id")
  .patch(authMiddleware, noteController.updateNote)
  .delete(authMiddleware, noteController.deleteNote);

module.exports = router;
