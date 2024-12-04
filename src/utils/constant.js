const statusCode = Object.freeze({
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
});

const responseMessage = Object.freeze({
  UNAUTHENTICATED: "Please login to continue.",
  EMAIL_ALREADY_USE: "Email is already in use by other account.",
  SIGNUP_SUCCESSFUL_BUT_VERIFYMAIL_NOT_SENT:
    "Signup successful, but verifiction email could not be send. Please try again later.",
  SIGNUP_SUCCESSFUL:
    "Signup successful. Verification email sent to provided email.",
  TOKEN_EXPIRED_REQUEST_NEW_MAIL:
    "Token expired. Please request a new verification email.",
  ERROR_DURING_VALIDATION: "Internal Server Error during validation.",
  INVALID_TOKEN_FOR_ACTION: "Invalid token for this action.",
  USER_NOT_FOUND: "User is not found.",
  USER_ALREADY_VERIFIED: "User is already verified.",
  USER_VERIFIED: "User is verified successfully.",
  FAILED_TO_VERIFY_USER: "Failed to verify user.",
  INVALID_EMAIL: "Invalid email. Please provide correct email.",
  USER_NOT_VERIFIED: "User is not verified.",
  INVALID_PASSWORD: "Invalid password. Please provide correct password.",
  LOGIN_SUCCESSFUL: "Login successful.",
  PASSWORD_RESET_LINK_SENT: "Password reset link sent to email.",
  NEW_PASSWORD_AND_CONFIRM_PASSWORD_NOT_MATCH:
    "New password and confirm password do not match.",
  NEW_PASSWORD_MUST_DIFFERENT_FROM_OLD_PASSWORD:
    "New password must be different from the old password.",
  PASSWORD_RESET: "Password reset successfully.",
  INVALID_TOKEN: "Invalid or expired token.",
  INCORRECT_OLD_PASSWORD: "Old Password is incorrect.",
  PASSWORD_CHANGED: "Password change successfully.",
  ERROR_WHILE_SEND_EMAIL: "Error while sending email.",
  VERIFY_EMAIL_SENT: "Verification email sent. Please verify your self.",
  PROFILE_PICTURE_UPDATED: "Profile picture updated successfully.",
  EXAM_NOT_FOUND: "Exam is not found.",
  ALREADY_GIVEN_EXAM: "You have already given this exam.",
  START_EXAM: "You can now start the exam.",
  ALREADY_SUBMIT_EXAM: "You have already submit this exam.",
  INVALID_QUESTION_ID: "Invalid question ID.",
  ATTEMPT_ALL_QUESTION: "Please attempt all the questions.",
  EXAM_SUBMITTED: "Exam submitted successfully.",
  RETRIEVED_GIVEN_EXAM: "Given exam retrieved successfully.",
  STUDENT_NOT_FOUND: "Student is not found.",
  PROFILE_UPDATED: "Profile updated successfully.",
  STUDENT_RETRIEVED: "Student retrieved successfully.",
  NO_STUDENT_GIVE_EXAM: "No students have given any exams yet.",
  STUDENT_DETAILS_RETRIEVED: "Student details retrieved successfully.",
  SUBJECT_MUST_BE_UNIQUE: "Subject name must be unique.",
  EXAM_CREATED: "Exam created successfully.",
  EXAM_RETRIEVED: "Exams retrieved successfully",
  EXAM_DETAILS_RETRIEVED: "Exam Details retrieved successfully",
  EXAM_UPDATED: "Exam is updated successfully.",
  EXAM_DELETED: "Exam is deleted successfully.",
});

module.exports = {statusCode, responseMessage};