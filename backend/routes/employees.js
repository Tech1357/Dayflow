import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../lib/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all employees (with search and filtering)
router.get('/', authenticateToken, [
  query('search').optional().isString(),
  query('status').optional().isIn(['ACTIVE', 'INACTIVE', 'TERMINATED']),
  query('department').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
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
      search, 
      status = 'ACTIVE', 
      department, 
      page = 1, 
      limit = 50 
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {
      status
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
        { position: { contains: search } }
      ];
    }

    if (department) {
      where.department = department;
    }

    // Get employees with attendance status
    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          user: {
            select: { role: true }
          },
          attendanceRecords: {
            where: {
              date: {
                equals: new Date(new Date().toISOString().split('T')[0])
              }
            },
            select: { status: true }
          }
        },
        orderBy: { firstName: 'asc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.employee.count({ where })
    ]);

    // Format response
    const formattedEmployees = employees.map(employee => {
      const todayAttendance = employee.attendanceRecords[0];
      let attendanceStatus = 'absent';
      
      if (todayAttendance) {
        switch (todayAttendance.status) {
          case 'PRESENT':
            attendanceStatus = 'present';
            break;
          case 'LEAVE':
            attendanceStatus = 'leave';
            break;
          default:
            attendanceStatus = 'absent';
        }
      }

      return {
        id: employee.id,
        employeeId: employee.employeeId,
        name: `${employee.firstName} ${employee.lastName}`,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        position: employee.position,
        department: employee.department,
        status: attendanceStatus,
        profilePicture: employee.profilePicture,
        hireDate: employee.hireDate,
        role: employee.user.role
      };
    });

    res.json({
      success: true,
      data: {
        employees: formattedEmployees,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get employee by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        user: {
          select: { role: true, email: true }
        },
        bankDetails: currentUser.role === 'ADMIN' || currentUser.role === 'HR' || currentUser.employee?.id === id,
        salaryInfo: currentUser.role === 'ADMIN' || currentUser.role === 'HR',
        skills: true,
        documents: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        },
        subordinates: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            position: true
          }
        }
      }
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check permissions for viewing full profile
    const canViewFullProfile = 
      currentUser.role === 'ADMIN' || 
      currentUser.role === 'HR' || 
      currentUser.employee?.id === id;

    const responseData = {
      id: employee.id,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      name: `${employee.firstName} ${employee.lastName}`,
      email: employee.email,
      position: employee.position,
      department: employee.department,
      hireDate: employee.hireDate,
      profilePicture: employee.profilePicture,
      role: employee.user.role,
      skills: employee.skills,
      documents: employee.documents,
      manager: employee.manager,
      subordinates: employee.subordinates
    };

    // Add sensitive data only if authorized
    if (canViewFullProfile) {
      responseData.phone = employee.phone;
      responseData.address = employee.address;
      responseData.dateOfBirth = employee.dateOfBirth;
      responseData.nationality = employee.nationality;
      responseData.maritalStatus = employee.maritalStatus;
      responseData.gender = employee.gender;
      responseData.emergencyContact = {
        name: employee.emergencyContactName,
        relationship: employee.emergencyContactRelationship,
        phone: employee.emergencyContactPhone
      };
      
      if (employee.bankDetails) {
        responseData.bankDetails = employee.bankDetails;
      }
    }

    // Add salary info only for admin/HR
    if (employee.salaryInfo && (currentUser.role === 'ADMIN' || currentUser.role === 'HR')) {
      responseData.salaryInfo = employee.salaryInfo;
    }

    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update employee
router.put('/:id', authenticateToken, [
  body('firstName').optional().notEmpty().trim(),
  body('lastName').optional().notEmpty().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().isMobilePhone(),
  body('position').optional().notEmpty().trim(),
  body('department').optional().notEmpty().trim(),
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

    const { id } = req.params;
    const currentUser = req.user;
    const updateData = req.body;

    // Check permissions
    const canUpdate = 
      currentUser.role === 'ADMIN' || 
      currentUser.role === 'HR' || 
      currentUser.employee?.id === id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    // Employees can only update certain fields
    if (currentUser.employee?.id === id && currentUser.role === 'EMPLOYEE') {
      const allowedFields = ['phone', 'address', 'emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'];
      const filteredData = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      
      updateData = filteredData;
    }

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { role: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Employee updated successfully',
      data: {
        id: updatedEmployee.id,
        employeeId: updatedEmployee.employeeId,
        firstName: updatedEmployee.firstName,
        lastName: updatedEmployee.lastName,
        name: `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
        email: updatedEmployee.email,
        phone: updatedEmployee.phone,
        position: updatedEmployee.position,
        department: updatedEmployee.department,
        address: updatedEmployee.address,
        role: updatedEmployee.user.role
      }
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get departments
router.get('/meta/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await prisma.employee.findMany({
      select: { department: true },
      distinct: ['department'],
      orderBy: { department: 'asc' }
    });

    res.json({
      success: true,
      data: departments.map(d => d.department)
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;