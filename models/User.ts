<<<<<<< HEAD
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

=======

// Minimal mock for User model with findById and select to prevent runtime errors
const User = {
	async findById() {
		return {
			_id: 'mockid',
			userId: 'mockuserid',
			name: 'Mock User',
			email: 'mock@example.com',
			role: 'admin',
			department: 'mock',
			specialization: 'mock',
			isActive: true,
			permissions: []
		};
	},
};
User.findById = function() {
	return {
		select: async function() {
			return {
				_id: 'mockid',
				userId: 'mockuserid',
				name: 'Mock User',
				email: 'mock@example.com',
				role: 'admin',
				department: 'mock',
				specialization: 'mock',
				isActive: true,
				permissions: []
			};
		}
	};
};
>>>>>>> 1d81179 (updated)
export default User;
