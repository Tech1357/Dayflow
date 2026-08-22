import express from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../lib/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Update basic profile
router.put('/basic', authenticateToken, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('phone').optional().isMobilePhone(),
  body('address').optional().isString()
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

    const currentUser = req.user;
    const updateData = req.body;

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: currentUser.employee.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        phone: updatedEmployee.phone,
        address: updatedEmployee.address
      }
    });
  } catch (error) {
    console.error('Update basic profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update private information
router.put('/private', authenticateToken, [
  body('dateOfBirth').optional().isISO8601(),
  body('nationality').optional().isString(),
  body('maritalStatus').optional().isIn(['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED']),
  body('gender').optional().isIn(['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY']),
  body('emergencyContactName').optional().isString(),
  body('emergencyContactRelationship').optional().isString(),
  body('emergencyContactPhone').optional().isMobilePhone()
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

    const currentUser = req.user;
    const updateData = req.body;

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Convert date string to Date object
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth);
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id: currentUser.employee.id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Private information updated successfully',
      data: {
        dateOfBirth: updatedEmployee.dateOfBirth,
        nationality: updatedEmployee.nationality,
        maritalStatus: updatedEmployee.maritalStatus,
        gender: updatedEmployee.gender,
        emergencyContact: {
          name: updatedEmployee.emergencyContactName,
          relationship: updatedEmployee.emergencyContactRelationship,
          phone: updatedEmployee.emergencyContactPhone
        }
      }
    });
  } catch (error) {
    console.error('Update private info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update bank details
router.put('/bank', authenticateToken, [
  body('accountHolderName').notEmpty().trim(),
  body('accountNumber').notEmpty().trim(),
  body('bankName').notEmpty().trim(),
  body('routingNumber').notEmpty().trim(),
  body('accountType').isIn(['CHECKING', 'SAVINGS'])
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

    const currentUser = req.user;
    const bankData = req.body;

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const bankDetails = await prisma.bankDetails.upsert({
      where: { employeeId: currentUser.employee.id },
      update: bankData,
      create: {
        ...bankData,
        employeeId: currentUser.employee.id
      }
    });

    res.json({
      success: true,
      message: 'Bank details updated successfully',
      data: {
        id: bankDetails.id,
        accountHolderName: bankDetails.accountHolderName,
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName,
        routingNumber: bankDetails.routingNumber,
        accountType: bankDetails.accountType
      }
    });
  } catch (error) {
    console.error('Update bank details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update salary information (Admin only)
router.put('/salary/:employeeId', authenticateToken, requireAdmin, [
  body('baseSalary').isNumeric(),
  body('currency').optional().isString(),
  body('paySchedule').optional().isIn(['WEEKLY', 'BI_WEEKLY', 'SEMI_MONTHLY', 'MONTHLY']),
  body('effectiveDate').isISO8601(),
  body('houseRentAllowance').optional().isNumeric(),
  body('standardAllowance').optional().isNumeric(),
  body('performanceBonus').optional().isNumeric(),
  body('leaveTravelAllowance').optional().isNumeric(),
  body('fixedAllowance').optional().isNumeric()
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

    const { employeeId } = req.params;
    const salaryData = req.body;

    // Convert date string to Date object
    if (salaryData.effectiveDate) {
      salaryData.effectiveDate = new Date(salaryData.effectiveDate);
    }

    const salaryInfo = await prisma.salaryInfo.upsert({
      where: { employeeId },
      update: salaryData,
      create: {
        ...salaryData,
        employeeId
      }
    });

    res.json({
      success: true,
      message: 'Salary information updated successfully',
      data: salaryInfo
    });
  } catch (error) {
    console.error('Update salary info error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add skill
router.post('/skills', authenticateToken, [
  body('name').notEmpty().trim(),
  body('level').isInt({ min: 1, max: 5 }),
  body('category').notEmpty().trim()
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

    const currentUser = req.user;
    const { name, level, category } = req.body;

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const skill = await prisma.skill.create({
      data: {
        employeeId: currentUser.employee.id,
        name,
        level,
        category
      }
    });

    res.status(201).json({
      success: true,
      message: 'Skill added successfully',
      data: skill
    });
  } catch (error) {
    console.error('Add skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update skill
router.put('/skills/:id', authenticateToken, [
  body('name').optional().notEmpty().trim(),
  body('level').optional().isInt({ min: 1, max: 5 }),
  body('category').optional().notEmpty().trim()
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

    const { id } = req.params;
    const currentUser = req.user;
    const updateData = req.body;

    // Check if skill belongs to current user
    const skill = await prisma.skill.findUnique({
      where: { id }
    });

    if (!skill || skill.employeeId !== currentUser.employee?.id) {
      return res.status(403).json({
        success: false,
        message: 'Skill not found or access denied'
      });
    }

    const updatedSkill = await prisma.skill.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: 'Skill updated successfully',
      data: updatedSkill
    });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete skill
router.delete('/skills/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // Check if skill belongs to current user
    const skill = await prisma.skill.findUnique({
      where: { id }
    });

    if (!skill || skill.employeeId !== currentUser.employee?.id) {
      return res.status(403).json({
        success: false,
        message: 'Skill not found or access denied'
      });
    }

    await prisma.skill.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Change password
router.put('/password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
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

    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    // Verify current password
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id }
    });

    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { password: hashedPassword }
    });

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;