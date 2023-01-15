import { connect } from 'mongoose';
import { app } from './app';

connect(process.env.DB!, async (err) => {
  if (err) {
    console.log('error connecting to db: ', err);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(process.env.PORT || 3000, async () => {
  console.log('Running on port: ', PORT);
  console.log(`http://localhost:${PORT}`);
});
