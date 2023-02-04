import mongoose from 'mongoose';
const Schema = mongoose.Schema;


const selectorSchema = new Schema({
  label: { type: String },
  selector: { type: String },
  extractorId: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});


export const SelectorModel = mongoose.model('Selector', selectorSchema);