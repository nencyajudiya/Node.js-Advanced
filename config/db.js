import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(` MongoDB Atlas connected: ${conn.connection.host}`);
        console.log(conn.connection.name);
        console.log(` Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    } catch (error) {
        console.error(` MongoDB Atlas connection error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;