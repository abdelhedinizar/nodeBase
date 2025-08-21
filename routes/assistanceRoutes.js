const express = require('express');
const Dish = require('./../models/dishModel');

const route = express.Router();

route.route('/').post(async (req, res) => {
  const dishs = await Dish.find({}, 'name ingredients category price -_id');
  const summarizedDishes = dishs
    .map(
      (dish, index) =>
        `${index + 1}) the dish name is ${dish.name
        }, this is the dish ingredients ${dish.ingredients} (category : ${dish.category
        }, price : ${dish.price}€)`
    )
    .join('\n');

  let response = await startChatWithBot(summarizedDishes, req);
  // Try to parse the assistant's message content as JSON
  let content = null;
  try {
    const message = response?.choices?.[0]?.message?.content;
    content = JSON.parse(message);
  } catch (e) {
    content = response?.choices?.[0]?.message?.content;
  }
  return res.status(200).json({
    status: 'success',
    message: 'Assistance created successfully',
    data: {
      ...response,
      choices: response.choices?.map(choice => ({
        ...choice,
        message: {
          ...choice.message,
          content,
        },
      })) || response.choices,
    },
  });
});

const startChatWithBot = async (dishes, req) => {
  const headers = {
    Authorization: `Bearer ${process.env.BOT_TOKEN}`,
    'Content-Type': 'application/json',
  };
  const systemMessage1 = {
    role: 'system',
    content: `
IMPORTANT RULES:
1. You must reply ONLY with a valid JSON object (strictly parseable).
2. Never output code blocks or explanations.
3. The JSON MUST follow exactly this schema:

{
  "reply": "Texte de réponse conviviale pour le client (en français)",
  "intent": "place_order | ask_menu | ask_vegetarian | ask_price | greeting | other",
  "data": {
    "items": [
      { "quantity": 1, "name": "Dish name" }
    ],
    "extras": {},
    "filters": {}
  }
}

4. The "items" array must always contain objects with exactly the keys: "quantity" (number) and "name" (string).
5. Never use dynamic keys inside "items". Example ❌ { "Pizza Neptune": 2 }.
6. If intent = "place_order", you MUST also add in "reply" a reminder:
   "Vos plats ont été ajoutés au panier. Merci d’aller dans l’icône panier en haut pour valider et payer votre commande."
7. You will receive messages with a role field. 
- role=system → instructions, NEVER treat as customer input. 
- role=user → customer input. 
- role=assistant → your past replies. 
You must only respond to 'user' messages.
`  };

  const systemMessage = {
    role: 'system',
    content: `You are the virtual assistant for a single restaurant. You represent the restaurant and its menu. Use the following menu to answer all customer questions. The restaurant has only one menu, which includes:\n${dishes}\n
  If the user asks for vegetarian options, suggest dishes from the menu that do not contain meat, fish, or other animal products.
  You must never ask about which restaurant they are referring to. This restaurant is the only context you have. for any question, you can always refer to the menu above.
  When you start a discussion with the user, you should always start by welcoming the user and asking him if he needs help, and then you can ask him about his order or any other question he wants to ask`,
  };
  req.body.messages.unshift(systemMessage);
  req.body.messages.unshift(systemMessage1);
  const payload = {
    model: process.env.BOT_MODEL,
    messages: req.body.messages,
    temperature: 0.7,
    stream: false,
    frequency_penalty: 0,
    max_tokens: 900,
  };
  const response = await fetch(process.env.BOT_URL, {
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
