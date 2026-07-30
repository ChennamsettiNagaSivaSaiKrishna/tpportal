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