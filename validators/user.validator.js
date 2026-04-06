import { param, body, validationResult } from "express-validator";

export const updateUserValidator = [
  param("id").isMongoId().withMessage("Invalid user id").bail(),
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = {};

      errors.array().forEach((error) => {
        formattedErrors[error.path] = error.msg;
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }
    next();
  },
  body("username")
    .optional()
    .isString()
    .withMessage("Username should be string")
    .bail()
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3-20 characters")
    .bail()
    .matches(/[a-zA-Z]/)
    .withMessage("Username must contain letters"),
  body("salary")
    .notEmpty()
    .withMessage("Salary is required")
    .bail()
    .isFloat()
    .withMessage("Salary should be number "),
  body("username")
    .optional()
    .isString()
    .withMessage("Username should be string"),
];
