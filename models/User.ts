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

export default User;
