import { Joi } from 'express-validation';

export default {
  // POST /api/users
  createUser: {
    body: Joi.object({
      username: Joi.string().required(),
    }),
  },

  // UPDATE /api/users/:userId
  updateUser: {
    body: Joi.object({
      id: Joi.number().integer(),
      username: Joi.string().required(),
      updatedAt: Joi.string(),
      createdAt: Joi.string(),
    }),
    params: Joi.object({
      userId: Joi.string().hex().required(),
    }),
  },

  // POST /api/auth/login
  login: {
    body: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  },
};
