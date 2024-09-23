// const passport = require('passport');
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
// const User = require('./models/userModel');  // Adjust the path as necessary
// const config = require('./config');  // Adjust the path as necessary
// const mongoose = require('mongoose');

// module.exports = function (passport) {
//     passport.use(new GoogleStrategy({
//         clientID: config.GOOGLE_CLIENT_ID,
//         clientSecret: config.GOOGLE_CLIENT_SECRET,
//         callbackURL: config.GOOGLE_REDIRECT_URL
//     },
//         async (accessToken, refreshToken, profile, done) => {
//             console.log('Google Strategy callback reached');
//             try {
//                 console.log('Google profile:', JSON.stringify(profile, null, 2));
//                 let user = await User.findOne({ googleid: profile.id });

//                 if (user) {
//                     console.log('Existing user found:', user);
//                     return done(null, user);
//                 }

//                 console.log('Creating new user');
//                 const newUser = new User({
//                     googleid: profile.id,
//                     firstname: profile.name.givenName || profile.displayName.split(' ')[0] || 'Unknown',
//                     lastname: profile.name.familyName || profile.displayName.split(' ').slice(1).join(' ') || 'Unknown',
//                     email: profile.emails[0].value,
//                     role: "user"
//                 });

//                 console.log('New user object:', newUser);

//                 user = await newUser.save();
//                 console.log('User saved successfully:', user);
//                 done(null, user);
//             } catch (error) {
//                 console.error('Error in Google Strategy:', error);
//                 done(error, null);
//             }
//         }));

//     passport.serializeUser((user, done) => {
//         console.log('Serializing user:', user._id);
//         done(null, user._id);
//     });

//     passport.deserializeUser(async (id, done) => {
//         console.log('Deserializing user ID:', id);
//         try {
//             if (!mongoose.Types.ObjectId.isValid(id)) {
//                 throw new Error('Invalid user ID');
//             }
//             const user = await User.findById(id);
//             if (!user) {
//                 throw new Error('User not found');
//             }
//             console.log('Deserialized user:', user);
//             done(null, user);
//         } catch (error) {
//             console.error('Error deserializing user:', error);
//             done(error, null);
//         }
//     });
// };



var GoogleStrategy = require('passport-google-oauth20').Strategy;
const config = require('./config');
const User = require('./models/userModel');


const googleAuth = (passport) => {

    passport.use(new GoogleStrategy({
        clientID: config.GOOGLE_CLIENT_ID,
        clientSecret: config.GOOGLE_CLIENT_SECRET,
        callbackURL: config.GOOGLE_REDIRECT_URL
    },
        async function (accessToken, refreshToken, profile, cb) {

            const userObject = {
                googleid: profile.id,
                firstname: profile.name.givenName,
                lastname: profile.name.familyName,
                email: profile.emails[0].value,
                role: "user"
            }

            console.log(userObject)
            const user = await User.findOne({ googleid: profile.id })

            if (user) {
                return cb(null, user)
            }
            User.create(userObject).then(() => {
                return cb(null, user);
            }).catch((err) => {
                return cb(err.message);
            })

            return cb(null, profile);
        }
    ));

    passport.serializeUser(function (user, cb) {
        cb(null, user.id);
    });

    passport.deserializeUser(async function (id, cb) {
        try {
            const user = await User.findById(id);
            cb(null, user);
        } catch (err) {
            cb(err);
        }
    });


}


module.exports = googleAuth;