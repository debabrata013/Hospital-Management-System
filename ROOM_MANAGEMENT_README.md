# Room Management System

## Overview
The Room Management System is a comprehensive solution for managing patient admissions, room allocations, discharges, and cleaning schedules in a hospital environment. It provides administrators with tools to efficiently manage room utilization and patient care workflows.

## Features

### 1. Room Overview Dashboard
- **Statistics Cards**: Total rooms, occupied rooms, cleaning required, maintenance status
- **Real-time Status**: View current room occupancy and availability
- **Quick Actions**: Access to admission, discharge, and cleaning functions

### 2. Room Management
- **Room Status Tracking**: Available, Occupied, Under Maintenance, Cleaning Required
- **Room Types**: General, Semi-Private, Private, ICU, Emergency
- **Capacity Management**: Track current vs. maximum occupancy
- **Floor Organization**: Organize rooms by floor levels

### 3. Patient Admission Management
- **Comprehensive Forms**: Patient demographics, medical history, insurance
- **Room Assignment**: Automatic room allocation based on availability
- **Medication Tracking**: Record all prescribed medications
- **Admission Notes**: Document patient condition and special requirements

### 4. Patient Discharge Process
- **Discharge Summary**: Final diagnosis and treatment outcomes
- **Medication at Discharge**: Prescriptions for home use
- **Follow-up Instructions**: Scheduled appointments and care instructions
- **Room Status Update**: Automatic room status change to "Cleaning Required"

### 5. Cleaning Management
- **Task Assignment**: Assign cleaning tasks to available staff
- **Priority Levels**: Low, Medium, High, Urgent
- **Cleaning Types**: Regular Clean, Deep Clean, Sanitization, Maintenance
- **Staff Availability**: Track cleaning staff workload and availability
- **Scheduling**: Set cleaning dates and estimated duration

### 6. Search and Filtering
- **Room Search**: Find rooms by number or type
- **Status Filtering**: Filter by room availability status
- **Type Filtering**: Filter by room category
- **Floor Filtering**: Organize by building floor

## User Roles and Permissions

### Admin & Super-Admin
- Full access to all room management functions
- Can create, update, and delete rooms
- Can assign cleaning tasks
- Can manage patient admissions and discharges

### HR Manager & Department Head
- View room status and patient information
- Assign cleaning tasks
- Limited room management capabilities

### Other Staff
- View-only access to room information
- Cannot modify room assignments or cleaning tasks

## API Endpoints

### Room Management (`/api/admin/rooms`)
- `GET`: Fetch rooms with filters
- `POST`: Create rooms, admit patients, discharge patients
- `PUT`: Update room and patient information
- `DELETE`: Remove rooms or patient records

### Cleaning Management (`/api/admin/cleaning`)
- `GET`: Fetch cleaning tasks and staff
- `POST`: Create cleaning tasks, assign cleaning
- `PUT`: Update task status, reassign tasks
- `DELETE`: Remove cleaning tasks

## Usage Workflow

### 1. Patient Admission
1. Navigate to Room Management → Rooms tab
2. Find an available room
3. Click "Admit Patient" button
4. Fill out the comprehensive admission form
5. Submit to automatically update room status

### 2. Patient Discharge
1. Go to Room Management → Patients tab
2. Find the patient to discharge
3. Click "Discharge" button
4. Complete discharge summary and instructions
5. Room automatically marked for cleaning

### 3. Cleaning Assignment
1. Navigate to Room Management → Cleaning tab
2. Click "New Cleaning Task" or "Assign Cleaning"
3. Select room and cleaning staff
4. Set priority and cleaning type
5. Schedule cleaning date and time

### 4. Room Status Monitoring
1. Use Overview tab for quick status check
2. Monitor cleaning schedules and pending tasks
3. Track room utilization and availability
4. View recent admissions and discharges

## Data Models

### Room
```typescript
interface Room {
  id: string
  roomNumber: string
  type: 'General' | 'Semi-Private' | 'Private' | 'ICU' | 'Emergency'
  floor: number
  capacity: number
  currentOccupancy: number
  status: 'Available' | 'Occupied' | 'Under Maintenance' | 'Cleaning Required'
  lastCleaned: string
  nextCleaningDue: string
}
```

### Patient
```typescript
interface Patient {
  id: string
  name: string
  admissionDate: string
  expectedDischargeDate: string
  actualDischargeDate?: string
  roomId: string
  diagnosis: string
  medications: string[]
  notes: string
  status: 'Admitted' | 'Discharged' | 'Transferred'
}
```

### Cleaning Task
```typescript
interface CleaningTask {
  id: string
  roomId: string
  roomNumber: string
  assignedTo: string
  assignedDate: string
  completedDate?: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Verified'
  notes: string
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
}
```

## Installation and Setup

1. **Navigate to Room Management**:
   ```
   /admin/room-management
   ```

2. **Ensure Proper Permissions**:
   - Must be logged in as admin, super-admin, or HR manager
   - Session cookies must be valid

3. **Database Setup**:
   - Currently uses mock data
   - Replace with actual database operations
   - Update API routes for production use

## Customization

### Adding New Room Types
1. Update the Room interface type definition
2. Add new options to room creation forms
3. Update filtering and display logic

### Modifying Cleaning Types
1. Update cleaning type options in forms
2. Adjust estimated duration calculations
3. Update priority handling logic

### Adding New Fields
1. Extend data models with new properties
2. Update form components
3. Modify API endpoints to handle new data

## Future Enhancements

- **Real-time Updates**: WebSocket integration for live status updates
- **Mobile App**: Native mobile application for staff
- **Integration**: Connect with other hospital systems
- **Analytics**: Advanced reporting and trend analysis
- **Automation**: AI-powered room assignment optimization
- **Notifications**: Automated alerts for cleaning due dates

## Support

For technical support or feature requests, contact the development team or create an issue in the project repository.

---

**Note**: This system is designed for hospital administrators and staff. Ensure proper training and access controls are in place before deployment in production environments.
