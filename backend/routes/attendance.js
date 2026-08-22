import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../lib/db.js';
import { authenticateToken, requireManagerOrAbove } from '../middleware/auth.js';

const router = express.Router();

// Get attendance records
router.get('/', authenticateToken, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2030 }),
  query('employeeId').optional().isString(),
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

    const currentUser = req.user;
    const { 
      month = new Date().getMonth() + 1,
      year = new Date().getFullYear(),
      employeeId,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build date range
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Build where clause
    const where = {
      date: {
        gte: startDate,
        lte: endDate
      }
    };

    // If not admin/HR, only show own records
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'HR') {
      where.employeeId = currentUser.employee?.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    const [attendanceRecords, total] = await Promise.all([
      prisma.attendance.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeId: true,
              position: true
            }
          }
        },
        orderBy: { date: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.attendance.count({ where })
    ]);

    // Format response
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      date: record.date,
      day: record.date.toLocaleDateString('en-US', { weekday: 'long' }),
      employee: `${record.employee.firstName} ${record.employee.lastName}`,
      employeeId: record.employee.employeeId,
      checkIn: record.checkIn ? record.checkIn.toTimeString().substring(0, 5) : '--',
      checkOut: record.checkOut ? record.checkOut.toTimeString().substring(0, 5) : '--',
      workHours: record.workHours ? `${record.workHours}` : '--',
      extraHours: record.extraHours ? `${record.extraHours}` : '--',
      status: record.status.toLowerCase()
    }));

    // Calculate stats
    const stats = {
      totalWorkingDays: attendanceRecords.length,
      presentDays: attendanceRecords.filter(r => r.status === 'PRESENT').length,
      leaveDays: attendanceRecords.filter(r => r.status === 'LEAVE').length,
      absentDays: attendanceRecords.filter(r => r.status === 'ABSENT').length
    };

    res.json({
      success: true,
      data: {
        attendanceRecords: formattedRecords,
        stats,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check in
router.post('/checkin', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Check if already checked in today
    const existingRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: currentUser.employee.id,
          date: today
        }
      }
    });

    if (existingRecord && existingRecord.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const checkInTime = new Date();

    const attendanceRecord = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId: currentUser.employee.id,
          date: today
        }
      },
      update: {
        checkIn: checkInTime,
        status: 'PRESENT'
      },
      create: {
        employeeId: currentUser.employee.id,
        date: today,
        checkIn: checkInTime,
        status: 'PRESENT'
      }
    });

    res.json({
      success: true,
      message: 'Checked in successfully',
      data: {
        checkIn: checkInTime.toTimeString().substring(0, 5),
        date: today
      }
    });
  } catch (error) {
    console.error('Check in error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Check out
router.post('/checkout', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Find today's attendance record
    const attendanceRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: currentUser.employee.id,
          date: today
        }
      }
    });

    if (!attendanceRecord || !attendanceRecord.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendanceRecord.checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    const checkOutTime = new Date();
    
    // Calculate work hours
    const workMilliseconds = checkOutTime.getTime() - attendanceRecord.checkIn.getTime();
    const workHours = workMilliseconds / (1000 * 60 * 60);
    const standardHours = 8;
    const extraHours = Math.max(0, workHours - standardHours);

    const updatedRecord = await prisma.attendance.update({
      where: { id: attendanceRecord.id },
      data: {
        checkOut: checkOutTime,
        workHours: Math.round(workHours * 100) / 100,
        extraHours: Math.round(extraHours * 100) / 100
      }
    });

    res.json({
      success: true,
      message: 'Checked out successfully',
      data: {
        checkOut: checkOutTime.toTimeString().substring(0, 5),
        workHours: updatedRecord.workHours,
        extraHours: updatedRecord.extraHours,
        date: today
      }
    });
  } catch (error) {
    console.error('Check out error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Mark attendance (Admin only)
router.post('/mark', authenticateToken, requireManagerOrAbove, [
  body('employeeId').notEmpty(),
  body('date').isISO8601(),
  body('status').isIn(['PRESENT', 'ABSENT', 'LEAVE', 'SICK']),
  body('checkIn').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('checkOut').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('notes').optional().isString()
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

    const { employeeId, date, status, checkIn, checkOut, notes } = req.body;

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    let checkInTime = null;
    let checkOutTime = null;
    let workHours = null;
    let extraHours = null;

    if (status === 'PRESENT' && checkIn && checkOut) {
      const [checkInHour, checkInMinute] = checkIn.split(':').map(Number);
      const [checkOutHour, checkOutMinute] = checkOut.split(':').map(Number);
      
      checkInTime = new Date(attendanceDate);
      checkInTime.setHours(checkInHour, checkInMinute, 0, 0);
      
      checkOutTime = new Date(attendanceDate);
      checkOutTime.setHours(checkOutHour, checkOutMinute, 0, 0);
      
      const workMilliseconds = checkOutTime.getTime() - checkInTime.getTime();
      workHours = workMilliseconds / (1000 * 60 * 60);
      const standardHours = 8;
      extraHours = Math.max(0, workHours - standardHours);
    }

    const attendanceRecord = await prisma.attendance.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: attendanceDate
        }
      },
      update: {
        status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours: workHours ? Math.round(workHours * 100) / 100 : null,
        extraHours: extraHours ? Math.round(extraHours * 100) / 100 : null,
        notes
      },
      create: {
        employeeId,
        date: attendanceDate,
        status,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        workHours: workHours ? Math.round(workHours * 100) / 100 : null,
        extraHours: extraHours ? Math.round(extraHours * 100) / 100 : null,
        notes
      }
    });

    res.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendanceRecord
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get today's attendance status
router.get('/status/today', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const attendanceRecord = await prisma.attendance.findUnique({
      where: {
        employeeId_date: {
          employeeId: currentUser.employee.id,
          date: today
        }
      }
    });

    res.json({
      success: true,
      data: {
        hasCheckedIn: !!attendanceRecord?.checkIn,
        hasCheckedOut: !!attendanceRecord?.checkOut,
        checkIn: attendanceRecord?.checkIn?.toTimeString().substring(0, 5),
        checkOut: attendanceRecord?.checkOut?.toTimeString().substring(0, 5),
        workHours: attendanceRecord?.workHours,
        status: attendanceRecord?.status || 'NOT_MARKED'
      }
    });
  } catch (error) {
    console.error('Get attendance status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;