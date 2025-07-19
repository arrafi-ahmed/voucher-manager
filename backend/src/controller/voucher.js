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

router.put("/updateStatusAndName", auth, (req, res, next) => {
  voucherService
    .updateStatusAndName(req.body)
    .then((result) => {
      if (result) {
        res
          .status(200)
          .json(new ApiResponse({ msg: "Voucher updated!", payload: result }));
      }
    })
    .catch((err) => next(err));
});

// Public endpoint for voucher verification (no auth required)
router.post("/verify", (req, res, next) => {
  const { email, voucherCode } = req.body;
  
  if (!email || !voucherCode) {
    return res.status(400).json(new ApiResponse({ 
      msg: "Email and voucher code are required", 
      success: false 
    }));
  }

  voucherService
    .verifyVoucherPurchase({ email, voucherCode })
    .then((result) => {
      res.status(200).json(new ApiResponse({ 
        msg: "Voucher verified successfully!", 
        payload: result 
      }));
    })
    .catch((err) => {
      res.status(400).json(new ApiResponse({ 
        msg: err.message, 
        success: false 
      }));
    });
});

// Public endpoint to mark voucher as redeemed
router.post("/redeem", (req, res, next) => {
  const { email, voucherCode } = req.body;
  
  if (!email || !voucherCode) {
    return res.status(400).json(new ApiResponse({ 
      msg: "Email and voucher code are required", 
      success: false 
    }));
  }

  voucherService
    .markVoucherAsRedeemed({ email, voucherCode })
    .then((result) => {
      res.status(200).json(new ApiResponse({ 
        msg: "Voucher redeemed successfully!", 
        payload: result 
      }));
    })
    .catch((err) => {
      res.status(400).json(new ApiResponse({ 
        msg: err.message, 
        success: false 
      }));
    });
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

// for admins
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

// for customers
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
