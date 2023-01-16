import { model, Schema } from 'mongoose';

const Extracted = new Schema({
  at: { type: Date, required: true },
  value: { type: String, required: true },
});

const schema = new Schema(
  {
    url: { type: String, required: true },
    selectors: [String],
    extracted: [Extracted],
  },
  { timestamps: true }
);

export const ExtractionModel = model('extractions', schema);
