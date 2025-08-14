import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
const AuditLog = mongoose.model('AuditLog', schema);
export default AuditLog;
