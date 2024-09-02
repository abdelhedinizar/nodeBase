const getAllUsers = (req, res) => {
  res.status(200).send('List of users');
};

const getUserById = (req, res) => {
  res.status(200).send(`User with id ${req.params.id}`);
};

const createUser = (req, res) => {
  console.log(req.body);
  res.status(201).send('User created');
};
const updateUser = (req, res) => {
  console.log(req.body);
  res.status(200).send('User updated');
};

const deleteUser = (req, res) => {
  res.status(204).send('User deleted');
};

module.exports =  { getAllUsers, getUserById, createUser, updateUser, deleteUser };