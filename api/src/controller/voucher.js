const router = require("express").Router();
const voucherService = require("../service/voucher");
const ApiResponse = require("../model/ApiResponse");
const { auth } = require("../middleware/auth");

router.post("/save", auth, (req, res, next) => {
  voucherService
    .save({
      ...req.body.newVoucher,
      userId: req.currentUser.id,
    })
    .then((result) => {
      if (result) {
        res
          .status(200)
          .json(new ApiResponse({ msg: "Voucher added!", payload: result }));
      }
    })
    .catch((err) => next(err));
});

router.get("/getVouchersByUserId", auth, (req, res, next) => {
  voucherService
    .getVouchersByUserId({
      ...req.query,
      userId: req.currentUser.id,
    })
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => next(err));
});

router.get("/getActiveVouchers", (req, res, next) => {
  voucherService
    .getActiveVouchers()
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => next(err));
});

router.get("/getPurchasesWUsersForOwnVouchers", auth, (req, res, next) => {
  voucherService
    .getPurchasesWUsersForOwnVouchers({
      userId: req.currentUser.id,
    })
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => next(err));
});

router.get("/getPurchasesWVouchers", auth, (req, res, next) => {
  voucherService
    .getPurchasesWVouchers({
      userId: req.currentUser.id,
    })
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => next(err));
});

router.get("/getVoucher", auth, (req, res, next) => {
  voucherService
    .getVoucher({
      ...req.query,
    })
    .then((result) => {
      res.status(200).json(new ApiResponse({ payload: result }));
    })
    .catch((err) => next(err));
});

router.get("/removeVoucher", auth, (req, res, next) => {
  voucherService
    .removeVoucher({
      ...req.query,
    })
    .then((result) => {
      res
        .status(200)
        .json(new ApiResponse({ msg: "Voucher removed!", payload: result }));
    })
    .catch((err) => next(err));
});

module.exports = router;
