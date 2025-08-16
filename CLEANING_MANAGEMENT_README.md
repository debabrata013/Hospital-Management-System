# Cleaning Management System

## Overview
The Cleaning Management System is a comprehensive solution for managing room cleaning tasks, staff assignments, and cleaning workflows in the hospital management system. It provides administrators with tools to efficiently manage room cleanliness and ensure proper hygiene standards.

## Features

### 1. Cleaning Task Management
- **Task Creation**: Create new cleaning tasks with specific requirements
- **Auto-Assignment**: Automatically assign cleaning tasks to available staff
- **Priority Levels**: Low, Medium, High, Urgent priority settings
- **Cleaning Types**: Regular Clean, Deep Clean, Sanitization, Maintenance
- **Status Tracking**: Pending, In Progress, Completed, Verified

### 2. Staff Management
- **Staff Profiles**: Track cleaning staff information and specializations
- **Workload Management**: Monitor current tasks vs. maximum capacity
- **Availability Status**: Available, Busy, Off Duty
- **Specializations**: Track staff expertise in different cleaning types
- **Shift Management**: Morning, Afternoon, Evening, Night shifts

### 3. Room Integration
- **Automatic Status Updates**: Rooms automatically marked as "Cleaning Required" after patient discharge
- **Status Synchronization**: Room status updated to "Available" after cleaning completion
- **Quick Assignment**: Direct cleaning assignment from room management interface

### 4. Dashboard & Analytics
- **Statistics Cards**: Total tasks, available staff, rooms needing cleaning, completed today
- **Real-time Updates**: Live status updates for tasks and staff
- **Filtering & Search**: Filter tasks by status, priority, and search functionality

## API Endpoints

### Cleaning Management (`/api/admin/cleaning`)

#### GET - Fetch cleaning data
```typescript
// Get all cleaning data
GET /api/admin/cleaning

// Get tasks only
GET /api/admin/cleaning?action=tasks&status=pending&priority=high

// Get staff only
GET /api/admin/cleaning?action=staff&status=available
```

#### POST - Create cleaning tasks
```typescript
// Create specific task
POST /api/admin/cleaning
{
  "action": "createTask",
  "roomId": "room_id",
  "assignedTo": "staff_name",
  "priority": "High",
  "cleaningType": "Deep Clean",
  "notes": "Special instructions",
  "estimatedDuration": 60
}

// Auto-assign cleaning
POST /api/admin/cleaning
{
  "action": "assignCleaning",
  "roomId": "room_id",
  "roomNumber": "202",
  "priority": "Medium",
  "cleaningType": "Regular Clean",
  "notes": "Routine cleaning"
}
```

#### PUT - Update task status
```typescript
PUT /api/admin/cleaning
{
  "taskId": "task_id",
  "status": "Completed",
  "notes": "Cleaning completed successfully"
}
```

#### DELETE - Delete task
```typescript
DELETE /api/admin/cleaning?taskId=task_id
```

### Room Management Integration (`/api/admin/rooms`)

#### POST - Update room status
```typescript
POST /api/admin/rooms
{
  "action": "updateRoomStatus",
  "roomId": "room_id",
  "status": "Available"
}
```

## Data Models

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
  priority: 'Low' | 'Medium' | 'High' | 'Urgent'
  cleaningType: 'Regular Clean' | 'Deep Clean' | 'Sanitization' | 'Maintenance'
  notes: string
  estimatedDuration: number
  createdAt: string
  updatedAt: string
}
```

### Cleaning Staff
```typescript
interface CleaningStaff {
  id: string
  name: string
  email: string
  phone: string
  status: 'Available' | 'Busy' | 'Off Duty'
  currentTasks: number
  maxTasks: number
  specialization: string[]
  shift: 'Morning' | 'Afternoon' | 'Evening' | 'Night'
  createdAt: string
}
```

## Usage Workflow

### 1. Patient Discharge → Room Cleaning
1. Patient is discharged from room
2. Room status automatically changes to "Cleaning Required"
3. Admin can assign cleaning task or use auto-assignment
4. Staff completes cleaning task
5. Room status automatically changes to "Available"

### 2. Manual Cleaning Assignment
1. Navigate to Room Management → Cleaning tab
2. Click "New Task" or "Auto Assign"
3. Select room, priority, and cleaning type
4. System assigns to available staff
5. Track progress through task status updates

### 3. Staff Management
1. View staff availability and workload
2. Monitor task assignments and completion rates
3. Adjust staff capacity and specializations as needed

## Components

### CleaningManagement
Main component for managing cleaning tasks and staff.
- **Location**: `/components/admin/CleaningManagement.tsx`
- **Features**: Task creation, staff management, status updates, filtering

### AssignCleaningButton
Quick assignment component for individual rooms.
- **Location**: `/components/admin/AssignCleaningButton.tsx`
- **Features**: Direct cleaning assignment from room cards

## Integration Points

### Room Management
- Cleaning tab added to room management interface
- Room status includes "Cleaning Required"
- Quick assignment buttons on room cards
- Automatic status synchronization

### Patient Management
- Patient discharge triggers room cleaning requirement
- Room status updates automatically

## Security & Permissions

### Access Control
- **Admin & Super-Admin**: Full access to all cleaning functions
- **HR Manager**: Can manage cleaning tasks and staff
- **Other Staff**: View-only access to cleaning information

### API Security
- Session-based authentication required
- Role-based access control
- Input validation and sanitization

## Future Enhancements

### Planned Features
- **Real-time Notifications**: WebSocket integration for live updates
- **Mobile App**: Staff mobile interface for task management
- **QR Code Integration**: Room scanning for task assignment
- **Cleaning Checklists**: Standardized cleaning procedures
- **Quality Assurance**: Photo verification of completed tasks
- **Analytics Dashboard**: Cleaning efficiency metrics
- **Scheduling System**: Advanced scheduling with recurring tasks
- **Inventory Management**: Cleaning supplies tracking

### Technical Improvements
- **Database Integration**: Replace mock data with real database
- **Caching**: Implement Redis for better performance
- **Background Jobs**: Automated task assignment and reminders
- **API Rate Limiting**: Protect against abuse
- **Audit Logging**: Track all cleaning operations

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- Next.js 14+
- React 18+

### Environment Variables
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Database Setup
Currently uses mock data. To integrate with real database:
1. Update API routes to use database models
2. Create database schemas for cleaning tasks and staff
3. Implement proper error handling and validation
4. Add database migrations

## Testing

### Manual Testing
1. Navigate to `/admin/room-management`
2. Go to Cleaning tab
3. Test task creation and assignment
4. Verify room status updates
5. Test staff management features

### API Testing
Use tools like Postman or curl to test API endpoints:
```bash
# Test cleaning API
curl -X GET http://localhost:3000/api/admin/cleaning

# Test task creation
curl -X POST http://localhost:3000/api/admin/cleaning \
  -H "Content-Type: application/json" \
  -d '{"action":"assignCleaning","roomId":"1","priority":"High"}'
```

## Troubleshooting

### Common Issues
1. **Tasks not assigning**: Check staff availability and specializations
2. **Room status not updating**: Verify API endpoint connectivity
3. **Permission errors**: Ensure proper user role and session

### Debug Mode
Enable debug logging in API routes for detailed error information.

## Support

For issues or questions about the cleaning management system:
1. Check the API documentation
2. Review the component source code
3. Test with the provided mock data
4. Verify environment configuration
