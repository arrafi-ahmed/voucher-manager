const router = require("express").Router();
const userService = require("../service/user");
const ApiResponse = require("../model/ApiResponse");

router.post("/save", (req, res, next) => {
    userService
        .save({payload: req.body})
        .then((result) => {
            if (result) {
                res
                    .status(200)
                    .json(new ApiResponse({
                        message: "Registration successful!",
                        payload: {
                            result
                        }
                    }));
            }
        })
        .catch((err) => next(err));
});

router.post("/signin", (req, res, next) => {
    userService
        .signin({payload: req.body})
        .then(({token, currentUser}) => {
            if (token) {
                res
                    .status(200)
                    .header("authorization", token)
                    .json(new ApiResponse({
                        msg: "Sign in successful!", payload:
                            {
                                currentUser
                            }
                    }));
            }
        })
        .catch((err) => next(err));
});

router.post("/requestResetPass", (req, res, next) => {
    userService
        .requestResetPass({payload: req.body})
        .then((result) => {
            res
                .status(200)
                .json(
                    new ApiResponse({msg: "Password reset link sent to your email!", payload: result}),
                );
        })
        .catch((err) => next(err));
});

router.post("/submitResetPass", (req, res, next) => {
    userService
        .submitResetPass({payload: req.body})
        .then((result) => {
            res
                .status(200)
                .json(new ApiResponse({msg: "Password reset successful!", payload: result}));
        })
        .catch((err) => next(err));
});

module.exports = router;
