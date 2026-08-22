import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@dayflow.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  });

  const adminEmployee = await prisma.employee.create({
    data: {
      userId: adminUser.id,
      employeeId: 'EMP0001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@dayflow.com',
      position: 'System Administrator',
      department: 'IT',
      hireDate: new Date('2024-01-01'),
      phone: '+1234567890',
      status: 'ACTIVE'
    }
  });

  // Create regular employee
  const employeePassword = await bcrypt.hash('employee123', 12);
  const employeeUser = await prisma.user.create({
    data: {
      email: 'employee@dayflow.com',
      password: employeePassword,
      role: 'EMPLOYEE'
    }
  });

  const employee = await prisma.employee.create({
    data: {
      userId: employeeUser.id,
      employeeId: 'EMP0002',
      firstName: 'John',
      lastName: 'Doe',
      email: 'employee@dayflow.com',
      position: 'Software Engineer',
      department: 'Engineering',
      hireDate: new Date('2024-01-15'),
      phone: '+1234567891',
      status: 'ACTIVE',
      managerId: adminEmployee.id
    }
  });

  // Create more employees
  const employees = [
    {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@dayflow.com',
      position: 'Product Manager',
      department: 'Product',
      hireDate: new Date('2024-02-01')
    },
    {
      firstName: 'Mike',
      lastName: 'Johnson',
      email: 'mike.johnson@dayflow.com',
      position: 'UX Designer',
      department: 'Design',
      hireDate: new Date('2024-02-15')
    },
    {
      firstName: 'Sarah',
      lastName: 'Wilson',
      email: 'sarah.wilson@dayflow.com',
      position: 'HR Manager',
      department: 'Human Resources',
      hireDate: new Date('2024-01-20')
    },
    {
      firstName: 'David',
      lastName: 'Brown',
      email: 'david.brown@dayflow.com',
      position: 'Sales Representative',
      department: 'Sales',
      hireDate: new Date('2024-03-01')
    },
    {
      firstName: 'Lisa',
      lastName: 'Davis',
      email: 'lisa.davis@dayflow.com',
      position: 'Marketing Specialist',
      department: 'Marketing',
      hireDate: new Date('2024-03-15')
    }
  ];

  const createdEmployees = [];
  for (let i = 0; i < employees.length; i++) {
    const empData = employees[i];
    const userPassword = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.create({
      data: {
        email: empData.email,
        password: userPassword,
        role: 'EMPLOYEE'
      }
    });

    const emp = await prisma.employee.create({
      data: {
        userId: user.id,
        employeeId: `EMP${(i + 3).toString().padStart(4, '0')}`,
        firstName: empData.firstName,
        lastName: empData.lastName,
        email: empData.email,
        position: empData.position,
        department: empData.department,
        hireDate: empData.hireDate,
        phone: `+123456789${i + 2}`,
        status: 'ACTIVE',
        managerId: adminEmployee.id
    }
    });

    createdEmployees.push(emp);
  }

  console.log('👥 Created employees');

  // Create time off balances for all employees
  const allEmployees = [adminEmployee, employee, ...createdEmployees];
  const currentYear = new Date().getFullYear();

  for (const emp of allEmployees) {
    await prisma.timeOffBalance.create({
      data: {
        employeeId: emp.id,
        year: currentYear,
        paidTimeOffTotal: 30,
        paidTimeOffUsed: Math.floor(Math.random() * 10),
        sickLeaveTotal: 10,
        sickLeaveUsed: Math.floor(Math.random() * 3)
      }
    });
  }

  console.log('🏖️ Created time off balances');

  // Create sample attendance records for the last 30 days
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (const emp of allEmployees.slice(0, 5)) { // Only for first 5 employees
      const shouldBePresent = Math.random() > 0.1; // 90% attendance rate
      
      if (shouldBePresent) {
        const checkInHour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
        const checkInMinute = Math.floor(Math.random() * 60);
        const checkOutHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const checkOutMinute = Math.floor(Math.random() * 60);
        
        const checkIn = new Date(date);
        checkIn.setHours(checkInHour, checkInMinute, 0, 0);
        
        const checkOut = new Date(date);
        checkOut.setHours(checkOutHour, checkOutMinute, 0, 0);
        
        const workMilliseconds = checkOut.getTime() - checkIn.getTime();
        const workHours = workMilliseconds / (1000 * 60 * 60);
        const extraHours = Math.max(0, workHours - 8);
        
        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: new Date(date.toDateString()),
            checkIn,
            checkOut,
            workHours: Math.round(workHours * 100) / 100,
            extraHours: Math.round(extraHours * 100) / 100,
            status: 'PRESENT'
          }
        });
      } else {
        // Random absent or leave
        const status = Math.random() > 0.5 ? 'ABSENT' : 'LEAVE';
        await prisma.attendance.create({
          data: {
            employeeId: emp.id,
            date: new Date(date.toDateString()),
            status
          }
        });
      }
    }
  }

  console.log('📅 Created attendance records');

  // Create sample time off requests
  const timeOffRequests = [
    {
      employeeId: employee.id,
      type: 'PAID_TIME_OFF',
      startDate: new Date('2024-12-24'),
      endDate: new Date('2024-12-26'),
      days: 3,
      reason: 'Christmas vacation',
      status: 'APPROVED',
      approverId: adminUser.id,
      approverName: 'Admin User',
      approvedAt: new Date()
    },
    {
      employeeId: createdEmployees[0].id,
      type: 'SICK_LEAVE',
      startDate: new Date('2024-11-15'),
      endDate: new Date('2024-11-15'),
      days: 1,
      reason: 'Medical appointment',
      status: 'PENDING'
    }
  ];

  for (const request of timeOffRequests) {
    await prisma.timeOffRequest.create({
      data: request
    });
  }

  console.log('🏖️ Created time off requests');

  // Add some skills for employees
  const skills = [
    { employeeId: employee.id, name: 'JavaScript', level: 5, category: 'Programming' },
    { employeeId: employee.id, name: 'React', level: 4, category: 'Frontend' },
    { employeeId: employee.id, name: 'Node.js', level: 4, category: 'Backend' },
    { employeeId: createdEmployees[0].id, name: 'Project Management', level: 5, category: 'Soft Skills' },
    { employeeId: createdEmployees[0].id, name: 'Agile', level: 4, category: 'Methodology' }
  ];

  for (const skill of skills) {
    await prisma.skill.create({
      data: skill
    });
  }

  console.log('🎯 Created skills');

  console.log('✅ Database seeding completed!');
  console.log('\n📧 Login credentials:');
  console.log('Admin: admin@dayflow.com / admin123');
  console.log('Employee: employee@dayflow.com / employee123');
  console.log('\n🔗 You can now start the server with: npm run dev');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });