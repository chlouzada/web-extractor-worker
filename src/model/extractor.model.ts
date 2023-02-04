import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const extractorSchema = new Schema({
  userId: { type: String },
  title: { type: String },
  url: { type: String },
  schedule: {
    type: String,
    enum: [
      'EVERY_15_MIN',
      'EVERY_HOUR',
      'EVERY_DAY',
      'EVERY_WEEK',
      'EVERY_MONTH',
    ],
  },
  status: { type: String, default: 'ENABLED', enum: ['ENABLED', 'DISABLED'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  results: [{ type: Schema.Types.ObjectId, ref: 'Result' }],
  selectors: [{ type: Schema.Types.ObjectId, ref: 'Selector' }],
});

export const ExtractorModel = mongoose.model('Extractor', extractorSchema);


