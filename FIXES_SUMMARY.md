# Fixes for Email Not Sending After Duitku Payment

## Root Causes Identified

### 1. **Product Type Mismatch**
- Webhook handler was checking for `productType === 'digital'`
- Products in database have `type: 'course'`
- **Fix**: Updated webhook to accept both `'digital'` and `'course'` types

### 2. **Resend API Authorization Issue**
- API key `re_A21Tmy6o_AGYYVFMcQHpotKmkS2Q5qmDk` is not authorized to send from `tepak.id` domain
- **Fix**: Changed sender email to use Resend's verified domain `onboarding@resend.dev` as fallback

### 3. **Signature Validation Too Strict**
- Duitku webhook signature validation only checked 2 formats
- **Fix**: Added 5 signature formats for better compatibility

### 4. **Poor Error Logging**
- Errors were not detailed enough for debugging
- **Fix**: Added comprehensive logging throughout the digital delivery flow

### 5. **Complex Database Query**
- Original query used complex joins that might fail
- **Fix**: Simplified to separate queries for order, customer, and product

## Files Modified

### 1. `src/lib/duitku.ts`
- Updated `validateWebhookSignature()` to support 5 signature formats
- Added detailed logging for signature verification

### 2. `src/pages/api/[...path].ts`
- Fixed body parsing to handle FormData and JSON
- Updated webhook handler to accept `course` type products
- Simplified database queries
- Added comprehensive logging
- Fixed type issues with body parsing

### 3. `src/lib/digital-delivery.ts`
- Added detailed logging to `createDigitalDelivery()`
- Improved error handling in `sendDigitalDeliveryEmail()`
- Changed sender email to use fallback verified domain
- Added token generation logging

## New Test Files Created

### 1. `test_digital_delivery.cjs`
- Tests database connectivity
- Checks recent successful orders
- Verifies digital products configuration
- Tests Resend API key

### 2. `diagnose_products.cjs`
- Diagnoses product table structure
- Checks order-product relationships
- Tests Resend API authorization

## How to Test the Fixes

### 1. Test Database Connectivity
```bash
node test_digital_delivery.cjs
```

### 2. Diagnose Product Issues
```bash
node diagnose_products.cjs
```

### 3. Simulate a Webhook (Development)
Use the existing script in `scratch/simulate_webhook.js`

### 4. Manual Testing Steps
1. Create a product with `type: 'course'` and valid `file_url`
2. Make a test purchase through Duitku sandbox
3. Check server logs for webhook receipt
4. Verify digital delivery record created in `digital_deliveries` table
5. Check if email was sent (check Resend dashboard)

## Remaining Issues & Recommendations

### 1. **Resend Domain Verification**
- The API key needs domain verification for `tepak.id`
- **Action**: Verify `tepak.id` domain in Resend dashboard OR
- **Action**: Use a different verified email sender

### 2. **Product File URLs**
- Some products have relative file URLs like `assets/...`
- **Action**: Ensure all digital products have absolute URLs

### 3. **Monitoring**
- Set up logging to monitor webhook failures
- Add alerting for email sending failures

### 4. **Backup Email Service**
- Consider adding fallback email service (SendGrid, SMTP, etc.)

## Expected Behavior After Fixes

1. **Successful Duitku Payment** → Webhook received
2. **Signature Validation** → Passes with one of 5 formats  
3. **Order Status Update** → Updated to 'success'
4. **Product Check** → Identifies `course` type as digital
5. **Digital Delivery Creation** → Record inserted in `digital_deliveries`
6. **Email Sending** → Sent via Resend with verified sender
7. **Customer Receives** → Email with download link

## Verification Checklist

- [ ] Webhook logs show successful signature validation
- [ ] Order status updates to 'success' in database
- [ ] Digital delivery record created for digital/course products
- [ ] Resend API accepts the email (check status 200)
- [ ] Customer receives email in inbox (not spam)
- [ ] Download link works correctly

## Contact for Further Assistance

If issues persist after applying these fixes:
1. Check server logs for specific error messages
2. Verify Resend API key is active and has sending permissions
3. Ensure products have correct `type` and `file_url` values
4. Test with a simple product that has absolute file URL