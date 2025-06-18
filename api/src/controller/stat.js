const router = require("express").Router();
const statService = require("../service/stat");
const ApiResponse = require("../model/ApiResponse");
const { auth } = require("../middleware/auth");

router.get("/admin", auth, async (req, res, next) => {
  statService
    .getAdminStats({ payload: { userId: req.currentUser.id } })
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => {
      next(err);
    });
});

module.exports = router;