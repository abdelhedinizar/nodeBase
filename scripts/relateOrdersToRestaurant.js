const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const Order = require('./../models/OrderModel');
const Restaurant = require('./../models/RestaurantModel');

async function relateAllOrdersToRestaurant() {
    try {
        await mongoose.connect(process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('DB connected');

        // Get all orders
        const orders = await Order.find();
        // Get the restaurant (assuming only one)
        const restaurant = await Restaurant.findOne();
        if (!restaurant) throw new Error('No restaurant found');

        // Update all orders to relate to the restaurant
        const updates = await Promise.all(
            orders.map(order => {
                order.restaurant = restaurant._id;
                return order.save();
            })
        );
        console.log(`Related ${updates.length} orders to restaurant ${restaurant._id}`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

relateAllOrdersToRestaurant();
