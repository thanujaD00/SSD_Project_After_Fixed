const express = require('express');
const passport = require('passport');
const { register, login, getDetails, updateUser, deleteUser, checkOldPassword, sendVerificationKey, changePassword, getUsers } = require('../controllers/auth.controllers');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        try {
            const token = req.user.token;
            const role = req.user.role;

            if (!token || !role) {
                console.error('Token or role is missing:', { token, role });
                return res.status(500).send('Authentication failed');
            }

            // Send an HTML page with a script to communicate with the opener
            res.send(`
                <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage({ token: "${token}", role: "${role}" }, "*");
                            window.close();
                        } else {
                            document.write('Authentication successful. You can close this window.');
                        }
                    </script>
                </body>
                </html>
            `);
        } catch (error) {
            console.error('Error in Google OAuth callback:', error);
            res.status(500).send('Authentication failed');
        }
    }
);
router.get('/profile', authenticate(), getDetails);
router.put('/updateUser', authenticate(['admin', 'user']), updateUser);
router.post('/deleteUser', authenticate(['admin']), deleteUser);
router.post('/resetPassword', authenticate(), checkOldPassword);
router.post('/sendVerificationCode', authenticate(), sendVerificationKey);
router.post('/changePassword', authenticate(), changePassword);
router.get('/getAllUsers', authenticate(['admin']), getUsers);

module.exports = router;