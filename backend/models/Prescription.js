import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
const Prescription = mongoose.model('Prescription', schema);
export default Prescription;
