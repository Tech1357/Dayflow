# Dayflow HRMS

A modern Human Resource Management System built with React, Tailwind CSS, and Vite. This application matches the Dayflow design specifications and provides comprehensive HR functionality for both employees and administrators.

## Features

### 🔐 Authentication
- Modern login and signup forms with loading states
- Role-based access (Employee/Admin)
- Responsive design with gradient backgrounds

### 👥 Employee Management
- Employee directory with search and filtering
- Interactive employee cards with status indicators
- Comprehensive profile management system

### 📊 Profile Management
- **My Profile**: Basic information with edit capabilities
- **Private Info**: Personal details and emergency contacts (restricted access)
- **Bank Details**: Secure banking information with masked account numbers
- **Salary Info**: Detailed compensation breakdown (Admin only)
- **Resume**: Document management, skills, and certifications
- **Skills**: Interactive skill management with star ratings
- **Security**: Password change, 2FA, session management

### ⏰ Attendance Tracking
- Monthly attendance view with navigation
- Attendance statistics and performance tracking
- Role-specific views (Admin overview vs Employee personal)
- Status indicators: Present (green), Leave (blue plane), Absent (yellow)

### 🏖️ Time Off Management
- Balance tracking for Paid Time Off and Sick Leave
- Request submission with calendar interface
- Admin approval workflow with Approve/Reject controls
- Team calendar view for administrators

## Technology Stack

- **Frontend**: React 18 with Hooks
- **Styling**: Tailwind CSS with custom design system
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Design System

The application uses a carefully crafted design system that includes:

- **Colors**: Primary (blue) and Secondary (purple) gradients
- **Typography**: Inter font family with responsive scaling
- **Spacing**: Consistent 8px grid system
- **Shadows**: Soft, medium, and card-specific shadow utilities
- **Animations**: Fade-in, slide-in, and hover effects
- **Components**: Reusable UI components with consistent styling

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dayflow-hrms
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Demo Credentials

**Admin Access:**
- Email: admin@dayflow.com
- Password: any value

**Employee Access:**
- Email: employee@dayflow.com  
- Password: any value

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Employee directory and cards
│   ├── profile/       # Profile management tabs
│   ├── attendance/    # Attendance tracking
│   ├── timeoff/       # Time off management
│   ├── layout/        # Header and navigation
│   └── common/        # Shared components
├── App.jsx            # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles and utilities
```

## Key Features Implementation

### Responsive Design
- Mobile-first approach with Tailwind CSS
- Collapsible navigation for mobile devices
- Adaptive layouts for tablets and desktops
- Touch-friendly interface elements

### Role-Based Access Control
- Admin users can view all employee data and manage approvals
- Employees can only access their own information
- Salary information restricted to HR/Admin roles
- Security settings only accessible in own profile

### Modern UI/UX
- Clean, professional interface matching Dayflow specifications
- Consistent visual hierarchy and spacing
- Interactive hover effects and smooth transitions
- Loading states and form validation
- Status indicators and progress tracking

### Performance Optimizations
- Efficient component structure with proper state management
- Optimized images and assets
- Smooth animations with hardware acceleration
- Minimal bundle size with tree shaking

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure and naming conventions
2. Ensure all new components are responsive and accessible
3. Test across different screen sizes and user roles
4. Update documentation for new features

## License

This project is proprietary software developed for Dayflow HRMS.