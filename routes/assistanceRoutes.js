const express = require('express');
const Dish = require('./../models/dishModel');

const route = express.Router();

route.route('/').post(async (req, res) => {
  const dishs = await Dish.find({}, 'name ingredients category price -_id');
  const summarizedDishes = dishs
    .map(
      (index, dish) =>
        `${index + 1}) the dish name is ${dish.name}, this is the dish ingredients ${dish.ingredients} (category : ${dish.category}, price : ${dish.price}£)`
    )
    .join('\n');

  let response = await startChatWithBot(summarizedDishes, req);
  return res.status(200).json({
    status: 'success',
    message: 'Assistance created successfully',
    data: response,
  });
});

const startChatWithBot = async (dishes, req) => {
  const apiUrl = 'https://proxy.tune.app/chat/completions';
  const headers = {
    Authorization: 'Bearer sk-tune-3qpKz1UQ45jGPN2Jed8z8Yj6GfDOEZ2YA7f',
    'Content-Type': 'application/json',
  };
  const systemMessage1 = {
    role: 'system',
    content: `You are a bot in an application for consulting the menu of the restaurant and making orders, so your job is to respond to any question about the restaurant and the dishes, please respect this menu `,
  };
  const systemMessage = {
    role: 'system',
    content: `You are the virtual assistant for a single restaurant. You represent the restaurant and its menu. Use the following menu to answer all customer questions. The restaurant has only one menu, which includes:\n${dishes}\n
  If the user asks for vegetarian options, suggest dishes from the menu that do not contain meat, fish, or other animal products.
  You must never ask about which restaurant they are referring to. This restaurant is the only context you have. for any question, you can always refer to the menu above.`,
  };
  req.body.messages.unshift(systemMessage);
  req.body.messages.unshift(systemMessage1);
  const payload = {
    model: 'meta/llama-3.2-90b-vision',
    messages: req.body.messages,
    temperature: 0.7,
    stream: false,
    frequency_penalty: 0,
    max_tokens: 900,
  };
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const result = await response.json();
  return result;
};

module.exports = route;