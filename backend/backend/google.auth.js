const GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config');
const User = require('./models/userModel');
const jwt = require('jsonwebtoken');

const googleAuth = (passport) => {
    passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_REDIRECT_URL
    },
        async function (accessToken, refreshToken, profile, cb) {
            try {
                let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] });

                if (user) {
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        await user.save();
                    }
                } else {
                    user = await User.create({
                        googleId: profile.id,
                        firstname: profile.name.givenName,
                        lastname: profile.name.familyName,
                        email: profile.emails[0].value,
                        role: "user"
                    });
                }

                const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
                user.token = token;

                return cb(null, user);
            } catch (error) {
                console.error('Google authentication error:', error);
                return cb(error);
            }
        }));

    passport.serializeUser((user, cb) => {
        cb(null, user.id);
    });

    passport.deserializeUser(async (id, cb) => {
        try {
            const user = await User.findById(id);
            cb(null, user);
        } catch (err) {
            cb(err);
        }
    });
};

module.exports = googleAuth;