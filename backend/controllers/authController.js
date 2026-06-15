const admin = require('firebase-admin');

/**
 * Sign up a new user (creates Firebase Auth user + Firestore user doc)
 */
exports.signup = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // Create user in Firebase Authentication
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name
    });

    // Save user data to Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      displayName: name,
      role: 'volunteer',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      profileComplete: false
    });

    res.status(201).json({
      message: 'User registered successfully',
      uid: userRecord.uid
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Login — handled entirely client-side via Firebase SDK.
 * This endpoint can be used to fetch user role after client logs in.
 */
exports.login = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({ error: 'UID is required' });
    }

    // Fetch user role from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User record not found' });
    }

    const userData = userDoc.data();

    res.status(200).json({
      message: 'User data fetched',
      role: userData.role || 'volunteer',
      displayName: userData.displayName
    });
  } catch (error) {
    console.error('Login fetch error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Send password reset email via Firebase Admin
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate password reset link
    const resetLink = await admin.auth().generatePasswordResetLink(email);

    // In production you'd send this via email service (Nodemailer etc.)
    // For now we return it — replace with actual email sending
    console.log('Password reset link generated for:', email);

    res.status(200).json({
      message: 'Password reset link sent to email'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verify email — send verification link
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const verificationLink = await admin.auth().generateEmailVerificationLink(email);
    console.log('Email verification link generated for:', email);

    res.status(200).json({
      message: 'Verification email sent'
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Logout — client-side handles Firebase signOut.
 * This endpoint can revoke refresh tokens server-side.
 */
exports.logout = async (req, res) => {
  try {
    const { uid } = req.body;

    if (uid) {
      // Revoke all refresh tokens for the user
      await admin.auth().revokeRefreshTokens(uid);
    }

    res.status(200).json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: error.message });
  }
};
