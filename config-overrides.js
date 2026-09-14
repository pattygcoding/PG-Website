const path = require("path");

module.exports = function override(config) {
    config.resolve.alias = {
        ...(config.resolve.alias || {}),
        "@": path.resolve(__dirname, "src"),
        "#": path.resolve(__dirname, "public"),
    };
    return config;
};

module.exports.jest = (config) => ({
    ...config,
    moduleNameMapper: {
        ...config.moduleNameMapper,
        "^@/(.*)$": "<rootDir>/src/$1",
        "^#/(.*)$": "<rootDir>/public/$1",
    },
});
