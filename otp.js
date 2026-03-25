import twilio from "twilio";

// Replace with your Twilio credentials
const accountSid = "";
const authToken = "";
const client = twilio(accountSid, authToken);

// Generate random 6-digit OTP
// function generateOTP() {
//   return Math.floor(100000 + Math.random() * 900000); // 6-digit number
// }

// export const dev = async function sendOTP(toNumber) {
//   const otp = generateOTP();

//   const message = await client.messages.create({
//     body: `Your OTP code is: ${otp}`,
//     from: "+1234567890", // Your Twilio number
//     to: toNumber, // Recipient number, e.g., "+919876543210"
//   });

//   console.log("OTP sent! SID:", message.sid);
//   return otp; // store this OTP in DB or memory for verification
// };

// Example usage
//await sendOTP("+").catch(console.error);

export const dev = async () => {
  const toNumber = "+";

  const otp = Math.floor(100000 + Math.random() * 900000);

  const message = await client.messages.create({
    body: `Your OTP code is: ${otp}`,
    from: "+", // Your Twilio number
    to: toNumber, // Recipient number, e.g., "+919876543210"
  });
};
