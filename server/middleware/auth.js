const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    try {
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ error: "Not authorized" })
        }
        const token = header.split(" ")[1];
        const payload =jwt.verify(token,process.env.JWT_SECRET);
        req.userId = payload.id;
        next();
    }
    catch(err) {
        return res.status(401).json({
            error:"Not authorized"
        })
    }
}

module.exports =requireAuth;