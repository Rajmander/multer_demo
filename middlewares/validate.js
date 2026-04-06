import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
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
};

// find()

// findOne()
// findOneAndUpdate()
// findOneAndDelete()

// findById()
// findByIdAndUpdate()
// findByIdAndDelete()

// updateOne()
// updateMany()

// deleteOne()
// deleteMany()

//insertMany()
