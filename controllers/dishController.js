const getAllDishs = (req, res) => {
  res.status(200).send('List of dishs');
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

module.exports = {
  getAllDishs,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
};
