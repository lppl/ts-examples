/** @type {import("ts-jest").JestConfigWithTsJest} */
module.exports = {
    preset: "ts-jest",
    globals: {
        "ts-jest": {
            isolatedModules: false,
        },
    },
    testEnvironment: "node",
};
