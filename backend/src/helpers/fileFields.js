const path = require("path");

// Base public directory
const publicDir = path.join(__dirname, "..", "..", "public");

// Centralized configuration for file fieldnames
const fileConfig = {
    userImages: {
        fieldname: "userImages",
        dir: path.join(publicDir, "user-images"),
        maxWidth: 400,
    },
};

const getConfigByFieldname = (fieldname) => {
    return (
        Object.values(fileConfig).find((cfg) => cfg.fieldname === fieldname) || null
    );
};

module.exports = {
    fileConfig,
    getConfigByFieldname,
};
