const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const appleSigninAuth = require('apple-signin-auth');

// Generate JWT token helper
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_local_jwt_secret_key_123456789', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register a new user with Email
// @route   POST /api/v1/auth/signup
// @access  Public
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide name, email, and password' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email address' });
    }

    const user = await User.create({
      name,
      email,
      password,
      authProvider: 'email',
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user with Email & Password
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Select password field explicitly since it's hidden by default in Schema
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.authProvider !== 'email') {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in or sign up with Google ID Token
// @route   POST /api/v1/auth/google
// @access  Public
exports.googleAuth = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, error: 'Google ID token is required' });
    }

    let googleUser = {};

    // Support development mode testing with mock token
    if (process.env.NODE_ENV !== 'production' && idToken === 'test-google-token') {
      googleUser = {
        email: 'testgoogle@example.com',
        name: 'Test Google User',
        providerId: 'google-test-id-12345',
        avatar: 'https://via.placeholder.com/150',
      };
    } else {
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      try {
        const ticket = await client.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        googleUser = {
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          providerId: payload.sub,
          avatar: payload.picture,
        };
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Google ID token verification failed. Make sure GOOGLE_CLIENT_ID is correct.',
          details: err.message,
        });
      }
    }

    // Find or create user
    let user = await User.findOne({ email: googleUser.email });

    if (user) {
      // Sync Google provider data if they previously registered differently or updates are needed
      user.authProvider = 'google';
      user.providerId = googleUser.providerId;
      if (googleUser.avatar) user.avatar = googleUser.avatar;
      await user.save();
    } else {
      user = await User.create({
        name: googleUser.name,
        email: googleUser.email,
        authProvider: 'google',
        providerId: googleUser.providerId,
        avatar: googleUser.avatar,
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sign in or sign up with Apple Identity Token
// @route   POST /api/v1/auth/apple
// @access  Public
exports.appleAuth = async (req, res, next) => {
  try {
    const { identityToken, name } = req.body;

    if (!identityToken) {
      return res.status(400).json({ success: false, error: 'Apple Identity token is required' });
    }

    let appleUser = {};

    // Support development mode testing with mock token
    if (process.env.NODE_ENV !== 'production' && identityToken === 'test-apple-token') {
      appleUser = {
        email: 'testapple@example.com',
        providerId: 'apple-test-id-67890',
        name: name || 'Test Apple User',
      };
    } else {
      try {
        const clientID = process.env.APPLE_CLIENT_ID;
        const verification = await appleSigninAuth.verifyIdToken(identityToken, {
          audience: clientID,
        });
        
        appleUser = {
          email: verification.email,
          providerId: verification.sub,
          name: name || verification.email.split('@')[0],
        };
      } catch (err) {
        return res.status(400).json({
          success: false,
          error: 'Apple Identity token verification failed. Make sure APPLE_CLIENT_ID is correct.',
          details: err.message,
        });
      }
    }

    // Find or create user
    let user = await User.findOne({ email: appleUser.email });

    if (user) {
      user.authProvider = 'apple';
      user.providerId = appleUser.providerId;
      await user.save();
    } else {
      user = await User.create({
        name: appleUser.name || 'Apple User',
        email: appleUser.email,
        authProvider: 'apple',
        providerId: appleUser.providerId,
      });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    // req.user is loaded in authMiddleware
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};
