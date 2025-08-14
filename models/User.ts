// Using a simple interface for now as the database schema is not fully known.
// This will be replaced with a proper database model.

export interface User {
  _id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  specialization?: string;
  isActive: boolean;
  permissions: string[];
  passwordHash: string;
}

// Placeholder for the actual database model
const User = {};

export default User;
