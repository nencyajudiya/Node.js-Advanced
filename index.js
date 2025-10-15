import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { server } from './app.js';

dotenv.config({ path: '.env.dev' });

connectDB();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
