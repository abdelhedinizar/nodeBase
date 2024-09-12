const getAllDishs = (req, res) => {
  const dishList = [
  {
    name: "Pizza Neptune",
    ingredients: "Tomato, tuna, onions, olives, cheese",
    image: "../images/pizza.jpg",
    price: "12",
  },
  {
    name: "Pizza Margherita",
    ingredients: "Tomato, mozzarella, fresh basil, olive oil, salt",
    image: "../images/margherita.jpg",
    price: "9",
  },
  {
    name: "Pizza Pepperoni",
    ingredients: "Tomato, mozzarella, pepperoni, olive oil",
    image: "../images/pepperoni.jpg",
    price: "13",
  },
  {
    name: "Pizza BBQ Chicken",
    ingredients: "BBQ sauce, chicken, mozzarella, onions, cilantro",
    image: "../images/bbq_chicken.jpg",
       price: "14"
  },
  {
    name: "Pizza Hawaiian",
    ingredients: "Tomato, mozzarella, ham, pineapple",
    image: "../images/hawaiian.jpg",
       price: "12"
  },
  {
    name: "Pizza Quattro Formaggi",
    ingredients: "Mozzarella, gorgonzola, parmesan, ricotta, olive oil",
    image: "../images/quattro_formaggi.jpg",
       price: "12",
  },
];

  res.status(200).json({dishList});
};

const getDishById = (req, res) => {
  res.status(200).send(`Dish with id ${req.params.id}`);
};

const createDish = (req, res) => {
  console.log(req.body);
  res.status(201).send('dish created');
};
const updateDish = (req, res) => {
  console.log(req.body);
  res.status(200).send('User updated');
};

const deleteDish = (req, res) => {
  res.status(204).send('User deleted');
};

const checkId = (req, res, next, val) => {
  if (req.body.id !== val) {
    return res.status(400).json({
      status: 'fail',
      message: 'Invalid id',
    });
  }
  next();
};

module.exports = {
  getAllDishs,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  checkId,
};
