"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const db_1 = require("../drizzle/db");
const schema_1 = require("../drizzle/schema");
const drizzle_orm_1 = require("drizzle-orm");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                message: "No token provided",
            });
            return;
        }
        const token = authHeader.substring(7);
        const decoded = (0, jwt_1.verifyAccessToken)(token);
        const user = await db_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.id, decoded.userId),
            columns: {
                id: true,
                email: true,
                name: true,
                isVerified: true,
            },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: "User not found",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authMiddleware.js.map