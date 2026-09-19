const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Your actual database connection

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // 1. Query user from your database
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    
    if (rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    const user = rows[0];

    // 2. Flexible password verification (supports both bcrypt hashes and legacy plaintext)
    let isPasswordValid = false;
    if (user.password_hash) {
      // Check if it's a valid bcrypt hash format
      if (user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2a$')) {
        isPasswordValid = await bcrypt.compare(password, user.password_hash);
      } else {
        // Fallback for direct plaintext matching if stored manually
        isPasswordValid = (password === user.password_hash);
      }
    }
    
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // 3. Determine user role
    const userRole = user.role || 'student';

    // 4. Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: userRole },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '1d' }
    );

    // 5. Send successful response back to frontend
    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.name,
        role: userRole,
        department_id: user.department_id
      }
    });

  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login process', 
      error: error.message 
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { email, password, full_name, roll_number, role, department_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Check if user already exists
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Hash new password securely with bcrypt for future registrations
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user details dynamically into database
    await db.query(
      `INSERT INTO users (email, password_hash, full_name, roll_number, role, department_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        email.trim(), 
        hashedPassword, 
        full_name || 'Student', 
        roll_number || '', 
        role || 'student', 
        department_id || 1, 
        1
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! You can now sign in.'
    });

  } catch (error) {
    console.error('Register Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during registration', 
      error: error.message 
    });
  }
};

exports.test = (req, res) => {
  return res.status(200).json({ success: true, message: 'Auth test route working' });
};

exports.me = (req, res) => {
  return res.status(200).json({ 
    success: true, 
    user: req.user || { id: 1, email: 'sai@gmail.com', role: 'student' } 
  });
};

// In-memory store for OTP verification (email -> { otp, expiresAt, verified })
const otpStore = new Map();

// 1. Request OTP for Forgot Password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists in database
    const [rows] = await db.query('SELECT id, email, full_name FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'No account registered with this email address.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(normalizedEmail, {
      otp,
      expiresAt,
      verified: false
    });

    console.log(`\n========================================`);
    console.log(`[AUTH] 🔐 PASSWORD RESET OTP GENERATED:`);
    console.log(`Email: ${normalizedEmail}`);
    console.log(`OTP Code: ${otp}`);
    console.log(`Expires: ${new Date(expiresAt).toLocaleTimeString()}`);
    console.log(`========================================\n`);

    return res.status(200).json({
      success: true,
      message: 'A 6-digit verification code has been generated.',
      // Provided in development for seamless testing without email server configuration
      otp: otp
    });
  } catch (error) {
    console.error('ForgotPassword Error:', error);
    return res.status(500).json({ success: false, message: 'Server error generating reset code.', error: error.message });
  }
};

// 2. Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification OTP code are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const entry = otpStore.get(normalizedEmail);

    if (!entry) {
      return res.status(400).json({ success: false, message: 'No reset request found or code has expired. Please request a new code.' });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: 'Verification code has expired. Please request a new code.' });
    }

    if (entry.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid verification code. Please check and try again.' });
    }

    entry.verified = true;

    return res.status(200).json({
      success: true,
      message: 'Verification code verified successfully. You can now reset your password.'
    });
  } catch (error) {
    console.error('VerifyOtp Error:', error);
    return res.status(500).json({ success: false, message: 'Server error during OTP verification.', error: error.message });
  }
};

// 3. Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const entry = otpStore.get(normalizedEmail);

    if (!entry || !entry.verified || entry.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid or unverified reset session. Please request a new OTP.' });
    }

    if (Date.now() > entry.expiresAt) {
      otpStore.delete(normalizedEmail);
      return res.status(400).json({ success: false, message: 'Session expired. Please request a new verification code.' });
    }

    // Hash the new password with bcrypt
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db.query('UPDATE users SET password_hash = ? WHERE LOWER(email) = ?', [hashedPassword, normalizedEmail]);

    // Clear the OTP entry
    otpStore.delete(normalizedEmail);

    console.log(`[AUTH] ✅ Password successfully reset for ${normalizedEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully! You can now log in.'
    });
  } catch (error) {
    console.error('ResetPassword Error:', error);
    return res.status(500).json({ success: false, message: 'Server error resetting password.', error: error.message });
  }
};