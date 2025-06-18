const router = require("express").Router();
const stripeService = require("../service/stripe");
const ApiResponse = require("../model/ApiResponse");
const { auth } = require("../middleware/auth");

router.post("/createPaymentIntent", auth, async (req, res, next) => {
  const { voucherId } = req.body;
  stripeService
    .createPaymentIntent({ payload: { voucherId, userId: req.currentUser.id } })
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => {
      next(err);
    });
});

const webhook = async (req, res, next) => {
  stripeService
    .webhook(req)
    .then((result) => {
      res.status(200).send(); //response sent to stripe
    })
    .catch((err) => {
      res.status(400).send(); //response sent to stripe}
    });
};
module.exports = { router, webhook };
