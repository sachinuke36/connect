"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authControllers_1 = require("../controllers/authControllers");
exports.default = (router) => {
    router.post("/login", authControllers_1.login);
    router.post("/register", authControllers_1.register);
    router.post("/deleteUser", authControllers_1.deleteUsers);
    router.get("/fetchallusers", authControllers_1.fetchAllUsers);
};
//# sourceMappingURL=auth.routes.js.map