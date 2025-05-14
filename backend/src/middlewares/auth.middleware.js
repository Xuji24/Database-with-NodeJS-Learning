const jwt = require('jsonwebtoken');

// login
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the Authorization header
        if (!token) {
            return res.status(401).json({ message: 'Access denied. Token not provided' });
        }

        // Verify the token using the secret key
        const decoded = await jwt.verify(token, process.env.JWT_SECRET_KEY);
        // Attach decoded data to request object
        req.customerID = decoded.id;
        req.email = decoded.email;
        req.user = decoded // attaching the whole payload
        
        console.log('Decoded token:', decoded); // Log the decoded token for debugging
        
        next(); // Call the next middleware or route handler
    } catch (err) {
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

// verifyUrlToken
const verifyUrlToken = (req, res, next) => {
    try {
        const token = req.params.token;

        if (!token) {
            return res.status(401).json({ message: 'Token not provided in URL.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Attach to request object
        req.email = decoded.email;
        req.user = decoded; // Optional: in case you store other payload fields

        console.log('URL token verified:', decoded);

        next();
    } catch (err) {
        console.error('URL token verification failed:', err.message);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = {
    verifyToken,
    verifyUrlToken
}; // Export the middleware function for use in other parts of the application