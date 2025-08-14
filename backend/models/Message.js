import mongoose from 'mongoose';
const schema = new mongoose.Schema({});
const Message = mongoose.model('Message', schema);
export default Message;
