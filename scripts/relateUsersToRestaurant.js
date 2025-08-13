const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const User = require('./../models/UserModel');
const Restaurant = require('./../models/RestaurantModel');

async function relateAllUsersToRestaurant() {
    try {
        await mongoose.connect(process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB connected');

        // Get all users
        const users = await User.find();
        // Get the restaurant (assuming only one)
        const restaurant = await Restaurant.findOne();
        if (!restaurant) throw new Error('No restaurant found');

        // Update all users to relate to the restaurant
        const updates = await Promise.all(
            users.map(user => {
                user.restaurant = restaurant._id;
                return user.save();
            })
        );
        console.log(`Related ${updates.length} users to restaurant ${restaurant._id}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

relateAllUsersToRestaurant();
