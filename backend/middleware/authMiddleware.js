const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from the request header
    const token = req.header('x-auth-token'); 
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify the token using the secret from the .env file
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = auth;