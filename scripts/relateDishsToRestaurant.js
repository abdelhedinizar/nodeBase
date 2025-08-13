const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Dish = require('./../models/dishModel');
const Restaurant = require('./../models/RestaurantModel');

async function relateAllDishsToRestaurant() {
    try {
        await mongoose.connect(process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB connected');

        // Get all dishes
        const dishs = await Dish.find();
        // Get the restaurant (assuming only one)
        const restaurant = await Restaurant.findOne();
        if (!restaurant) throw new Error('No restaurant found');

        // Update all dishes to relate to the restaurant
        const updates = await Promise.all(
            dishs.map(dish => {
                dish.restaurant = restaurant._id;
                if (dish.status !== 'published') {
                    dish.status = 'published';
                }
                return dish.save();
            })
        );
        console.log(`Related ${updates.length} dishes to restaurant ${restaurant._id}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

relateAllDishsToRestaurant();
