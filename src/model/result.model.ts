import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const resultSchema = new Schema({
  value: { type: String },
  extractorId:  { type: String },
  selectorId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

export const ResultModel = mongoose.model('Result', resultSchema);
