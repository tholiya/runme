const mongoose = require('mongoose');
global.dynamicModels = {};
(async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URI);
    } catch (error) {
        console.log(error);
        console.log("MongoDB connection failed");
        process.exit(1);
    }
})();
