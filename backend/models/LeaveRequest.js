import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
const LeaveRequest = mongoose.model('LeaveRequest', schema);
export default LeaveRequest;
