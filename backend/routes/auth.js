import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import prisma from '../lib/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Helper function to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user with employee data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        employee: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employee: user.employee ? {
            id: user.employee.id,
            employeeId: user.employee.employeeId,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            name: `${user.employee.firstName} ${user.employee.lastName}`,
            position: user.employee.position,
            department: user.employee.department,
            profilePicture: user.employee.profilePicture
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Register
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('position').notEmpty().trim(),
  body('department').notEmpty().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      position, 
      department, 
      role = 'EMPLOYEE' 
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate employee ID
    const employeeCount = await prisma.employee.count();
    const employeeId = `EMP${(employeeCount + 1).toString().padStart(4, '0')}`;

    // Create user and employee in transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role
        }
      });

      const employee = await tx.employee.create({
        data: {
          userId: user.id,
          employeeId,
          firstName,
          lastName,
          email,
          position,
          department,
          hireDate: new Date()
        }
      });

      // Create initial time off balance
      await tx.timeOffBalance.create({
        data: {
          employeeId: employee.id,
          year: new Date().getFullYear(),
          paidTimeOffTotal: 30,
          paidTimeOffUsed: 0,
          sickLeaveTotal: 10,
          sickLeaveUsed: 0
        }
      });

      return { user, employee };
    });

    // Generate token
    const token = generateToken(result.user.id, result.user.role);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        token,
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
          employee: {
            id: result.employee.id,
            employeeId: result.employee.employeeId,
            firstName: result.employee.firstName,
            lastName: result.employee.lastName,
            name: `${result.employee.firstName} ${result.employee.lastName}`,
            position: result.employee.position,
            department: result.employee.department
          }
        }
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Verify token
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employee: user.employee ? {
            id: user.employee.id,
            employeeId: user.employee.employeeId,
            firstName: user.employee.firstName,
            lastName: user.employee.lastName,
            name: `${user.employee.firstName} ${user.employee.lastName}`,
            position: user.employee.position,
            department: user.employee.department,
            profilePicture: user.employee.profilePicture
          } : null
        }
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;