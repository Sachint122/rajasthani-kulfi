const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kulfi_house';
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        console.log('Please make sure MongoDB is running on your system');
        console.log('You can install MongoDB from: https://docs.mongodb.com/manual/installation/');
        process.exit(1);
    }
};

module.exports = connectDB; 