const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

//Load environment variables from .env file
dotenv.config();

//Create Express app and set up port
const app = express();
const PORT = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(express.json());

//Import routes
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

//Use routes
app.use('/api', authRoutes);
app.use('/api', bookRoutes);
app.use('/api', reviewRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Book Review API');
})

//Connect to MongoDB and start the server
const startServer = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

startServer();