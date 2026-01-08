# Forgot Password Testing Guide

## What Was Fixed

The OTP verification was failing because:

1. The `resetPasswordOTP` field has `select: false` in the schema
2. The query wasn't explicitly selecting these fields using `.select('+fieldName')`
3. OTP wasn't being trimmed, so whitespace could cause mismatches

## Changes Made

### 1. `verifyResetOTP` Function

- Now explicitly selects OTP fields: `.select("+resetPasswordOTP +resetPasswordOTPExpire")`
- Trims OTP input: `otp.toString().trim()`
- Validates OTP format: Must be exactly 6 digits
- Better error messages:
  - "No password reset request found" - if OTP fields don't exist
  - "OTP has expired" - if time has passed
  - "Invalid OTP" - if OTP doesn't match

### 2. `resetPassword` Function

- Same fixes as verifyResetOTP
- Also selects password field: `.select("+resetPasswordOTP +resetPasswordOTPExpire +password")`

## How to Test

### Step 1: Request OTP

```bash
curl -X POST http://localhost:3001/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@bennett.edu.in"}'
```

Expected Response:

```json
{
  "success": true,
  "message": "Password reset OTP sent to your email. Valid for 10 minutes."
}
```

### Step 2: Check Your Email

- Open your email inbox
- Look for email from gintokisakata81076@gmail.com
- Subject: "🔐 Password Reset OTP - Bennett Network"
- Copy the 6-digit OTP (e.g., 123456)

### Step 3: Verify OTP

```bash
curl -X POST http://localhost:3001/api/auth/verify-reset-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@bennett.edu.in","otp":"123456"}'
```

Expected Response:

```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password."
}
```

### Step 4: Reset Password

```bash
curl -X POST http://localhost:3001/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"YOUR_EMAIL@bennett.edu.in",
    "otp":"123456",
    "newPassword":"NewPassword123!",
    "confirmPassword":"NewPassword123!"
  }'
```

Expected Response:

```json
{
  "success": true,
  "message": "Password reset successful! You can now login with your new password."
}
```

### Step 5: Test Login with New Password

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"YOUR_EMAIL@bennett.edu.in","password":"NewPassword123!"}'
```

Expected: You should get a JWT token and user data.

## Testing in Frontend

1. Open http://localhost:5174 (or your frontend port)
2. Click "Login"
3. Click "Forgot Password?" link below password field
4. Enter your email
5. Check your email for OTP
6. Enter the 6-digit OTP
7. Set new password
8. Login with new password

## Common Issues

### "Invalid OTP" Error

- **Cause**: OTP doesn't match what was sent
- **Solution**:
  - Copy OTP exactly from email
  - Don't add spaces or extra characters
  - Make sure you're using the most recent OTP
  - OTP is case-sensitive (though it's all numbers)

### "OTP has expired" Error

- **Cause**: More than 10 minutes passed since OTP was sent
- **Solution**: Request a new OTP

### "No password reset request found" Error

- **Cause**: No OTP was generated for this email
- **Solution**: Click "Forgot Password" and request OTP first

## OTP Security Features

✅ 6-digit random number (100000-999999)
✅ SHA256 hashed in database
✅ 10-minute expiration
✅ Cleared after successful password reset
✅ One-time use (cleared after use)
✅ Email-only delivery

## Troubleshooting

### Check if OTP was saved in database

```javascript
// In MongoDB shell or Compass
db.users.findOne(
  { email: "YOUR_EMAIL@bennett.edu.in" },
  { resetPasswordOTP: 1, resetPasswordOTPExpire: 1 }
);
```

### Check auth service logs

```bash
tail -f /tmp/auth-service.log
```

### Verify email configuration

Check `.env` file has:

```
EMAIL_USERNAME=gintokisakata81076@gmail.com
EMAIL_PASSWORD=gvhfxdmnzlapfqee
EMAIL_FROM=gintokisakata81076@gmail.com
```
