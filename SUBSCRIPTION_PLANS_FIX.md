# Fix Subscription Plans Display on Landing Page & Creator Dashboard

## Problem Summary

The landing page and creator dashboard are not showing the list of subscription plans (Free, Pro, etc.) because:

1. **Missing Database Columns**: The `subscription_plans` table is missing critical columns:
   - `tier_category` - Tier level (Starter, Professional, etc.)
   - `tier_description` - Detailed tier description  
   - `is_active` - Boolean flag to show/hide plans

2. **No Active Plans Displayed**: The landing page fetch query uses `.eq("is_active", true)`, which filters out all plans if the column is NULL or doesn't exist.

3. **Creator Dashboard**: Plan information section was missing from the plan-info page.

## Solution

### Step 1: Run SQL Migration in Supabase

1. Go to your Supabase project → SQL Editor
2. Create a new query
3. Copy and paste the content from `fix_subscription_plans.sql`
4. Click "RUN"

**File**: `d:\Kerjaan\Tepak.ID\fix_subscription_plans.sql`

This will:
- Add missing `tier_category` and `tier_description` columns
- Populate them with proper values
- Ensure all plans have `is_active = true`

### Step 2: Verify the Fix

Run the diagnostic script to confirm:
```bash
node check_plans_detailed.js
```

You should see output like:
```
[0] ID: free
    Active: true
    Tier Category: Starter
    Tier Description: Perfect for creators...
    Features: ["Landing Page Builder", "Basic Analytics", ...]

[1] ID: pro
    Active: true
    Tier Category: Professional
    Tier Description: For growing digital businesses...
```

### Step 3: Review the Changes

**Changes Made:**

1. **PlanInfoDashboard Component** (`src/components/profile/PlanInfoDashboard.tsx`):
   - Added fetch functionality to load all available subscription plans
   - Added a new "Paket Tersedia" (Available Plans) section showing:
     - All plans with pricing and features
     - Comparison between user's current plan and other options
     - Ability to see plan details and upgrade options
   - Plans are displayed in a responsive grid layout

2. **SQL Migration File** (`fix_subscription_plans.sql`):
   - Adds missing columns to subscription_plans table
   - Updates free and pro plans with tier information
   - Ensures all plans are marked as active

3. **Landing Page** (`src/pages/index.astro`):
   - Already has code to fetch and display plans
   - Will work correctly once the database fix is applied

### File Locations

- **Landing Page (Main Site)**: `src/pages/index.astro` - Pricing section shows all plans
- **Creator Plan Info Page**: `src/pages/plan-info.astro` with `src/components/profile/PlanInfoDashboard.tsx` - Now shows available plans for comparison
- **SQL Fix**: `fix_subscription_plans.sql` - Run in Supabase SQL Editor
- **Verification**: `check_plans_detailed.js` - Verify the fix worked

## Testing Checklist

After applying the SQL fix:

- [ ] Navigate to home page (`/`) - Should see pricing cards for Free, Pro plans
- [ ] Login and go to `/plan-info` - Should see your current plan + list of all available plans to compare
- [ ] Check that plans display correctly on both desktop and mobile
- [ ] Verify tier categories and descriptions appear correctly
- [ ] Test upgrade/downgrade flows in the plan info page

## Troubleshooting

### Plans still don't show on landing page

1. Check browser console for errors
2. Verify the SQL migration was successful: `SELECT is_active, tier_category FROM public.subscription_plans;`
3. Clear browser cache and rebuild if using build process

### Column errors in logs

- The `tier_category` and `tier_description` columns are required
- Run the SQL migration in Supabase SQL Editor (not CLI)
- Don't use Prisma migrations for this (it uses direct SQL)

### Tier information not displaying

- Verify the UPDATE statements in the SQL ran successfully
- Check that your specific plan IDs match exactly ('free' and 'pro')
- If you have custom plan IDs, add them to the tier updates in the SQL

## Additional Notes

- The `aa` plan in the database appears to be a test plan - consider deleting it if not needed
- Plans are public-readable (RLS policy allows anyone to view active plans)
- Only admins can modify/create/delete plans

---

**Last Updated**: 2026-04-24
**Status**: Ready for SQL migration in Supabase
