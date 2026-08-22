import express from 'express';
import { body, validationResult, query } from 'express-validator';
import prisma from '../lib/db.js';
import { authenticateToken, requireManagerOrAbove } from '../middleware/auth.js';

const router = express.Router();

// Get time off requests
router.get('/requests', authenticateToken, [
  query('status').optional().isIn(['PENDING', 'APPROVED', 'REJECTED']),
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
      status,
      employeeId,
      page = 1,
      limit = 50
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};

    if (status) {
      where.status = status;
    }

    // If not admin/HR, only show own requests
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'HR') {
      where.employeeId = currentUser.employee?.id;
    } else if (employeeId) {
      where.employeeId = employeeId;
    }

    const [requests, total] = await Promise.all([
      prisma.timeOffRequest.findMany({
        where,
        include: {
          employee: {
            select: {
              firstName: true,
              lastName: true,
              employeeId: true,
              position: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.timeOffRequest.count({ where })
    ]);

    // Format response
    const formattedRequests = requests.map(request => ({
      id: request.id,
      employee: `${request.employee.firstName} ${request.employee.lastName}`,
      employeeId: request.employee.employeeId,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      type: request.type,
      status: request.status.toLowerCase(),
      reason: request.reason,
      requestedDate: request.createdAt,
      approverName: request.approverName,
      approvedAt: request.approvedAt,
      rejectionReason: request.rejectionReason,
      attachmentPath: request.attachmentPath
    }));

    res.json({
      success: true,
      data: {
        requests: formattedRequests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get time off requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Submit time off request
router.post('/requests', authenticateToken, [
  body('type').isIn(['PAID_TIME_OFF', 'SICK_LEAVE', 'UNPAID_LEAVE', 'MATERNITY_LEAVE', 'PATERNITY_LEAVE', 'BEREAVEMENT_LEAVE']),
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').notEmpty().isString()
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
    const { type, startDate, endDate, reason } = req.body;

    if (!currentUser.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    // Calculate days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (days <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date range'
      });
    }

    // Check for overlapping requests
    const overlappingRequest = await prisma.timeOffRequest.findFirst({
      where: {
        employeeId: currentUser.employee.id,
        status: { in: ['PENDING', 'APPROVED'] },
        OR: [
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: start } }
            ]
          }
        ]
      }
    });

    if (overlappingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a time off request for overlapping dates'
      });
    }

    // Check available balance
    const currentYear = new Date().getFullYear();
    const balance = await prisma.timeOffBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId: currentUser.employee.id,
          year: currentYear
        }
      }
    });

    if (balance) {
      if (type === 'PAID_TIME_OFF') {
        const availablePTO = balance.paidTimeOffTotal - balance.paidTimeOffUsed;
        if (days > availablePTO) {
          return res.status(400).json({
            success: false,
            message: `Insufficient PTO balance. Available: ${availablePTO} days, Requested: ${days} days`
          });
        }
      } else if (type === 'SICK_LEAVE') {
        const availableSick = balance.sickLeaveTotal - balance.sickLeaveUsed;
        if (days > availableSick) {
          return res.status(400).json({
            success: false,
            message: `Insufficient sick leave balance. Available: ${availableSick} days, Requested: ${days} days`
          });
        }
      }
    }

    const timeOffRequest = await prisma.timeOffRequest.create({
      data: {
        employeeId: currentUser.employee.id,
        type,
        startDate: start,
        endDate: end,
        days,
        reason,
        status: 'PENDING'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Time off request submitted successfully',
      data: {
        id: timeOffRequest.id,
        type: timeOffRequest.type,
        startDate: timeOffRequest.startDate,
        endDate: timeOffRequest.endDate,
        days: timeOffRequest.days,
        status: timeOffRequest.status.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Submit time off request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Approve/Reject time off request
router.patch('/requests/:id', authenticateToken, requireManagerOrAbove, [
  body('action').isIn(['approve', 'reject']),
  body('rejectionReason').optional().isString()
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
    const { action, rejectionReason } = req.body;
    const currentUser = req.user;

    const timeOffRequest = await prisma.timeOffRequest.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!timeOffRequest) {
      return res.status(404).json({
        success: false,
        message: 'Time off request not found'
      });
    }

    if (timeOffRequest.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Request has already been processed'
      });
    }

    const updateData = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      approverId: currentUser.id,
      approverName: currentUser.employee ? 
        `${currentUser.employee.firstName} ${currentUser.employee.lastName}` : 
        'Admin',
      approvedAt: new Date()
    };

    if (action === 'reject' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // If approving, update balance
    if (action === 'approve') {
      const currentYear = new Date().getFullYear();
      
      if (timeOffRequest.type === 'PAID_TIME_OFF') {
        await prisma.timeOffBalance.update({
          where: {
            employeeId_year: {
              employeeId: timeOffRequest.employeeId,
              year: currentYear
            }
          },
          data: {
            paidTimeOffUsed: {
              increment: timeOffRequest.days
            }
          }
        });
      } else if (timeOffRequest.type === 'SICK_LEAVE') {
        await prisma.timeOffBalance.update({
          where: {
            employeeId_year: {
              employeeId: timeOffRequest.employeeId,
              year: currentYear
            }
          },
          data: {
            sickLeaveUsed: {
              increment: timeOffRequest.days
            }
          }
        });
      }
    }

    const updatedRequest = await prisma.timeOffRequest.update({
      where: { id },
      data: updateData
    });

    res.json({
      success: true,
      message: `Time off request ${action}d successfully`,
      data: {
        id: updatedRequest.id,
        status: updatedRequest.status.toLowerCase(),
        approverName: updatedRequest.approverName,
        approvedAt: updatedRequest.approvedAt,
        rejectionReason: updatedRequest.rejectionReason
      }
    });
  } catch (error) {
    console.error('Process time off request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get time off balance
router.get('/balance', authenticateToken, async (req, res) => {
  try {
    const currentUser = req.user;
    const { employeeId } = req.query;

    if (!currentUser.employee && !employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const targetEmployeeId = employeeId || currentUser.employee.id;

    // Check permission to view balance
    if (employeeId && 
        currentUser.role !== 'ADMIN' && 
        currentUser.role !== 'HR' && 
        currentUser.employee?.id !== employeeId) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    const currentYear = new Date().getFullYear();

    let balance = await prisma.timeOffBalance.findUnique({
      where: {
        employeeId_year: {
          employeeId: targetEmployeeId,
          year: currentYear
        }
      }
    });

    // Create balance record if it doesn't exist
    if (!balance) {
      balance = await prisma.timeOffBalance.create({
        data: {
          employeeId: targetEmployeeId,
          year: currentYear,
          paidTimeOffTotal: 30,
          paidTimeOffUsed: 0,
          sickLeaveTotal: 10,
          sickLeaveUsed: 0
        }
      });
    }

    res.json({
      success: true,
      data: {
        paidTimeOff: {
          total: balance.paidTimeOffTotal,
          used: balance.paidTimeOffUsed,
          available: balance.paidTimeOffTotal - balance.paidTimeOffUsed
        },
        sickTimeOff: {
          total: balance.sickLeaveTotal,
          used: balance.sickLeaveUsed,
          available: balance.sickLeaveTotal - balance.sickLeaveUsed
        },
        year: balance.year
      }
    });
  } catch (error) {
    console.error('Get time off balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get time off calendar (for admin)
router.get('/calendar', authenticateToken, requireManagerOrAbove, [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020, max: 2030 })
], async (req, res) => {
  try {
    const { 
      month = new Date().getMonth() + 1,
      year = new Date().getFullYear()
    } = req.query;

    // Get all approved time off requests for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const timeOffRequests = await prisma.timeOffRequest.findMany({
      where: {
        status: 'APPROVED',
        OR: [
          {
            AND: [
              { startDate: { lte: endDate } },
              { endDate: { gte: startDate } }
            ]
          }
        ]
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeId: true
          }
        }
      }
    });

    const formattedRequests = timeOffRequests.map(request => ({
      id: request.id,
      employee: `${request.employee.firstName} ${request.employee.lastName}`,
      employeeId: request.employee.employeeId,
      startDate: request.startDate,
      endDate: request.endDate,
      days: request.days,
      type: request.type
    }));

    res.json({
      success: true,
      data: {
        requests: formattedRequests,
        month: parseInt(month),
        year: parseInt(year)
      }
    });
  } catch (error) {
    console.error('Get time off calendar error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;