const router = require("express").Router();
const productService = require("../service/product");
const importExportService = require("../service/importExport");
const ApiResponse = require("../model/ApiResponse");
const uploadFiles = require("../middleware/upload");
const compressImages = require("../middleware/compress");
const {auth, isAuthenticated} = require("../middleware/auth");
const {
    VUE_BASE_URL,
    getClientIP,
    reverseGeocode,
    getFilePath,
} = require("../helpers/util");
const CustomError = require("../model/CustomError");
const mime = require("mime-types");

router.post("/save", auth, uploadFiles(), compressImages, (req, res, next) => {
    productService
        .save({
            payload: {...req.body, userId: req.currentUser.id},
            files: req.files,
        })
        .then((result) => {
            if (result) {
                res.status(200).json(new ApiResponse({msg: "Product added!", payload: result}));
            }
        })
        .catch((err) => next(err));
});

router.get("/getProductsByUserId", auth, (req, res, next) => {
    productService
        .getProductsByUserId({
            payload: {...req.query, userId: req.currentUser.id},
        })
        .then((result) => {
            res.status(200).json(new ApiResponse({payload: result}));
        })
        .catch((err) => next(err));
});

router.get("/removeProduct", auth, (req, res, next) => {
    productService
        .removeProduct({
            payload: {...req.query},
        })
        .then((result) => {
            res.status(200).json(new ApiResponse({msg: "Product removed!", payload: result}));
        })
        .catch((err) => next(err));
});

router.get("/downloadManual", (req, res, next) => {
    const filename = req.query.filename;
    const filePath = getFilePath(filename, "productManuals");
    const contentType = mime.lookup(filename) || "application/octet-stream";

    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Type", contentType);

    res.download(filePath, (err) => {
        if (err) {
            console.error("Error sending file:", err);
            res
                .status(500)
                .json(new ApiResponse({msg: "Could not download the file"}));
        } else {
        }
    });
});

router.post("/bulkImport", auth, uploadFiles(), async (req, res, next) => {
    try {
        const zipFile = req.files?.importZip?.[0];
        if (!zipFile) return res.status(400).json({message: "ZIP file required"});

        const result = await importExportService.bulkImport({
            zipFile,
            userId: req.currentUser.id,
        });
        res.json(
            new ApiResponse(
                `${result.productCount} Products imported successfully!`,
                result,
            ),
        );
    } catch (err) {
        next(err);
    }
});

router.get("/bulkExport", auth, async (req, res, next) => {
    try {
        const userId = req.currentUser?.id;

        const stream = await importExportService.bulkExport({userId});

        res.setHeader(
            "Content-Disposition",
            "attachment; filename=product-export.zip",
        );
        res.setHeader("Content-Type", "application/zip");

        stream.pipe(res);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
