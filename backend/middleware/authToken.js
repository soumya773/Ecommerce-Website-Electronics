const jwt = require('jsonwebtoken');

function authToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ success: false, error: true, message: 'Please log in.' });
  jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
    if (err || !decoded?._id) return res.status(401).json({ success: false, error: true, message: 'Session expired. Please log in again.' });
    req.userId = decoded._id;
    return next();
  });
}
module.exports = authToken;
