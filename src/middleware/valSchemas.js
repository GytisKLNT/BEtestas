const Joi = require('joi');

const registrationSchema = Joi.object({
  name: Joi.string().trim().required(),
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required(),
});

const changePassSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
});

const addWineSchema = Joi.object({
  title: Joi.string().trim().required(),
  region: Joi.string().trim().required(),
  year: Joi.number().required(),
});

const addUserWineSchema = Joi.object({
  wine_id: Joi.number().required(),
  quantity: Joi.number().required(),
});

module.exports = {
  registrationSchema,
  loginSchema,
  changePassSchema,
  addWineSchema,
  addUserWineSchema,
};
