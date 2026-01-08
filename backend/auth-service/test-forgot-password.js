/**
 * Test script for Forgot Password functionality
 * Run with: node test-forgot-password.js
 */

const axios = require("axios");

const BASE_URL = "http://localhost:3001/api/auth";

// Test email - make sure this user exists in your database
const TEST_EMAIL = "test@bennett.edu.in";

async function testForgotPasswordFlow() {
  console.log("🧪 Testing Forgot Password Flow\n");
  console.log("=".repeat(60));

  try {
    // Step 1: Request OTP
    console.log("\n📧 Step 1: Requesting OTP for", TEST_EMAIL);
    console.log("-".repeat(60));

    const otpResponse = await axios.post(`${BASE_URL}/forgot-password`, {
      email: TEST_EMAIL,
    });

    console.log("✅ Status:", otpResponse.status);
    console.log("✅ Response:", otpResponse.data);
    console.log("\n⚠️  Check your email for the OTP!");
    console.log("   Email:", TEST_EMAIL);

    // Prompt for OTP
    console.log("\n" + "=".repeat(60));
    console.log("📝 Please check your email and enter the 6-digit OTP");
    console.log("   Then run the verification manually using:");
    console.log(
      "\n   curl -X POST http://localhost:3001/api/auth/verify-reset-otp \\"
    );
    console.log('     -H "Content-Type: application/json" \\');
    console.log(`     -d '{"email":"${TEST_EMAIL}","otp":"YOUR_OTP"}'`);
    console.log("\n   After verification, reset password using:");
    console.log(
      "\n   curl -X POST http://localhost:3001/api/auth/reset-password \\"
    );
    console.log('     -H "Content-Type: application/json" \\');
    console.log(
      `     -d '{"email":"${TEST_EMAIL}","otp":"YOUR_OTP","newPassword":"NewPass123!","confirmPassword":"NewPass123!"}'`
    );
    console.log("=".repeat(60));
  } catch (error) {
    console.error(
      "\n❌ Error during test:",
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      console.log(
        "\n⚠️  User not found! Please update TEST_EMAIL in the script"
      );
      console.log("   or create a test user first.");
    }
  }
}

// Additional helper functions for manual testing
async function verifyOTP(email, otp) {
  console.log("\n🔍 Verifying OTP...");
  try {
    const response = await axios.post(`${BASE_URL}/verify-reset-otp`, {
      email,
      otp,
    });
    console.log("✅ OTP Verified:", response.data);
    return true;
  } catch (error) {
    console.error(
      "❌ OTP Verification Failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

async function resetPassword(email, otp, newPassword) {
  console.log("\n🔐 Resetting password...");
  try {
    const response = await axios.post(`${BASE_URL}/reset-password`, {
      email,
      otp,
      newPassword,
      confirmPassword: newPassword,
    });
    console.log("✅ Password Reset Successful:", response.data);
    return true;
  } catch (error) {
    console.error(
      "❌ Password Reset Failed:",
      error.response?.data || error.message
    );
    return false;
  }
}

// Test login error messages
async function testLoginErrors() {
  console.log("\n\n🧪 Testing Login Error Messages\n");
  console.log("=".repeat(60));

  const testCases = [
    {
      name: "Missing credentials",
      data: {},
      expectedError: "MISSING_CREDENTIALS",
    },
    {
      name: "Invalid email format",
      data: { email: "invalid-email", password: "test123" },
      expectedError: "INVALID_EMAIL",
    },
    {
      name: "Non-existent account",
      data: { email: "nonexistent@bennett.edu.in", password: "test123" },
      expectedError: "ACCOUNT_NOT_FOUND",
    },
    {
      name: "Incorrect password",
      data: { email: TEST_EMAIL, password: "wrongpassword" },
      expectedError: "INCORRECT_PASSWORD",
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log("-".repeat(60));

    try {
      await axios.post(`${BASE_URL}/login`, testCase.data);
      console.log("⚠️  Login succeeded (unexpected)");
    } catch (error) {
      const errorData = error.response?.data;
      console.log("Status:", error.response?.status);
      console.log("Error Type:", errorData?.errorType);
      console.log("Message:", errorData?.message);

      if (errorData?.errorType === testCase.expectedError) {
        console.log("✅ Error message is correct!");
      } else {
        console.log(
          `⚠️  Expected ${testCase.expectedError}, got ${errorData?.errorType}`
        );
      }
    }
  }
}

// Run tests
console.log("\n🚀 Starting Tests...\n");

const args = process.argv.slice(2);

if (args[0] === "login-errors") {
  testLoginErrors();
} else if (args[0] === "verify" && args[1] && args[2]) {
  verifyOTP(args[1], args[2]);
} else if (args[0] === "reset" && args[1] && args[2] && args[3]) {
  resetPassword(args[1], args[2], args[3]);
} else {
  testForgotPasswordFlow();
  console.log(
    "\n💡 To test login errors, run: node test-forgot-password.js login-errors"
  );
}
