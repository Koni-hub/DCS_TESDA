import passport from 'passport';
import "dotenv/config";

import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
    new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CLIENT_CALLBACK
    },
    function(accessToken, refreshToken, profile, done) {
        // Save profile and tokens in session
        return done(null, { profile, accessToken, refreshToken });
    }
));

passport.serializeUser(function(profile, done) {
    done(null, profile);
});

passport.deserializeUser(function(profile, done) {
    done(null, profile);
});

export default passport;