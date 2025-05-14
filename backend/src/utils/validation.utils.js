// Check empty fields for both SignUp and Login
function checkFields(email, password, confirmPassword = null, res) {
    try {
        // Check for missing fields
        if (!email) {
            return { status: 400, message: 'Missing email field' };
        }
        if (!password) {
            return { status: 400, message: 'Missing password field' };
        }
        if (confirmPassword !== null && !confirmPassword) {
            return { status: 400, message: 'Missing confirm password field' };
        } else {
            // Check if the password and confirm password match
            if (password !== confirmPassword) {
                return { status: 400, message: 'Password and confirm password do not match' };
            }
        }
        return null; // No errors
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = checkFields;