import express from 'express';
import usersController from '../controllers/users';
import validateUser from '../helpers/validateUser';

const router = express.Router();

router.get('/', usersController.getAllUsers);
router.post('/', validateUser.create, usersController.registerUser);

router.get('/:user_id/orders', usersController.userOrderHistory);

router.get('/:user_id', usersController.getUserById);
router.put('/:user_id', validateUser.update, usersController.updateUser);
router.delete('/:user_id', usersController.deleteUser);

export default router;
