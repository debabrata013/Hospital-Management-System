import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
const Appointment = mongoose.model('Appointment', schema);
export default Appointment;
