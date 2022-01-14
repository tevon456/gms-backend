const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middleware");
const { noteController } = require("../controllers");

router
  .route("/")
  .get(authMiddleware, noteController.getAllCustomerNotes)
  .post(authMiddleware, noteController.createNote);

router
  .route("/:id")
  .patch(authMiddleware, noteController.updateNote)
  .delete(authMiddleware, noteController.deleteNote);

module.exports = router;
