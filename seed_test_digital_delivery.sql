-- ==============================================================================
-- SEED DATA FOR TESTING DIGITAL DELIVERY
-- Run this in Supabase SQL Editor to create test data
-- ==============================================================================

-- Generate a test token
DO $$
DECLARE
    v_test_token TEXT := 'dd_' || EXTRACT(EPOCH FROM NOW())::BIGINT || '_test123';
    v_merchant_id UUID;
    v_customer_id UUID;
    v_product_id UUID;
    v_order_id UUID;
    v_test_email TEXT := 'acepali2253@gmail.com';
    v_file_url TEXT := 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
BEGIN
    -- ==========================================================================
    -- STEP 1: Get or create a test merchant (creator)
    -- ==========================================================================
    
    -- Try to find an existing user to use as merchant
    SELECT id INTO v_merchant_id 
    FROM auth.users 
    LIMIT 1;
    
    -- If no user exists, you'll need to create one first via signup
    IF v_merchant_id IS NULL THEN
        RAISE EXCEPTION 'No user found in auth.users. Please create a user first via signup.';
    END IF;
    
    RAISE NOTICE 'Using merchant_id: %', v_merchant_id;
    
    -- Ensure profile exists for this user
    INSERT INTO public.profiles (id, full_name, username, bio, role)
    VALUES (
        v_merchant_id, 
        'Test Creator', 
        'testcreator', 
        'Test creator for digital delivery', 
        'user'
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Ensure user_settings exists
    INSERT INTO public.user_settings (user_id, plan_status, domain_name, domain_verified)
    VALUES (v_merchant_id, 'pro', 'testcreator', true)
    ON CONFLICT (user_id) DO NOTHING;
    
    -- ==========================================================================
    -- STEP 2: Create a test digital product
    -- ==========================================================================
    
    v_product_id := gen_random_uuid();
    
    INSERT INTO public.products (
        id,
        merchant_id,
        title,
        description,
        price,
        type,
        status,
        file_url,
        cover_url,
        created_at,
        updated_at
    )
    VALUES (
        v_product_id,
        v_merchant_id,
        'E-Book: Panduan Lengkap Digital Marketing',
        'E-book premium dengan 100+ halaman panduan lengkap digital marketing untuk pemula. Include strategi content, ads, dan automation.',
        50000,
        'digital',
        'published',
        v_file_url,
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop',
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created product_id: %', v_product_id;
    
    -- ==========================================================================
    -- STEP 3: Create a test customer
    -- ==========================================================================
    
    v_customer_id := gen_random_uuid();
    
    INSERT INTO public.customers (
        id,
        merchant_id,
        email,
        name,
        phone,
        created_at
    )
    VALUES (
        v_customer_id,
        v_merchant_id,
        v_test_email,
        'Test Buyer',
        '081234567890',
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created customer_id: % with email: %', v_customer_id, v_test_email;
    
    -- ==========================================================================
    -- STEP 4: Create a test order (paid status)
    -- ==========================================================================
    
    v_order_id := gen_random_uuid();
    
    INSERT INTO public.orders (
        id,
        invoice_id,
        merchant_id,
        customer_id,
        product_id,
        amount,
        platform_fee,
        net_amount,
        status,
        payment_method,
        paid_at,
        created_at,
        updated_at
    )
    VALUES (
        v_order_id,
        'INV-TEST-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT,
        v_merchant_id,
        v_customer_id,
        v_product_id,
        50000,
        2500,
        47500,
        'success',
        'test_payment',
        NOW(),
        NOW(),
        NOW()
    )
    ON CONFLICT DO NOTHING;
    
    RAISE NOTICE 'Created order_id: %', v_order_id;
    
    -- ==========================================================================
    -- STEP 5: Create digital delivery record
    -- ==========================================================================
    
    -- Clean up old test delivery with same token if exists
    DELETE FROM public.digital_deliveries WHERE token = v_test_token;
    
    INSERT INTO public.digital_deliveries (
        order_id,
        token,
        file_url,
        signed_url,
        expires_at,
        accessed_email,
        access_count,
        created_at
    )
    VALUES (
        v_order_id,
        v_test_token,
        v_file_url,
        v_file_url,  -- For testing, using same URL as signed
        NOW() + INTERVAL '7 days',
        v_test_email,
        0,
        NOW()
    );
    
    -- ==========================================================================
    -- OUTPUT: Display test information
    -- ==========================================================================
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'TEST DATA CREATED SUCCESSFULLY!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Test Email: %', v_test_email;
    RAISE NOTICE 'Token: %', v_test_token;
    RAISE NOTICE '';
    RAISE NOTICE '--- LOCAL TEST URL ---';
    RAISE NOTICE 'http://localhost:4321/digital-delivery/%?email=%', 
        v_test_token, 
        v_test_email;
    RAISE NOTICE '';
    RAISE NOTICE '--- PRODUCTION TEST URL ---';
    RAISE NOTICE 'https://tepak.id/digital-delivery/%?email=%', 
        v_test_token, 
        v_test_email;
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    
END $$;

-- ==============================================================================
-- VERIFICATION QUERY (Run separately to confirm data exists)
-- ==============================================================================

-- Check the created delivery record
SELECT 
    dd.id,
    dd.token,
    dd.accessed_email,
    dd.expires_at,
    dd.access_count,
    o.invoice_id,
    o.amount,
    o.status as order_status,
    p.title as product_title,
    c.name as customer_name,
    c.email as customer_email,
    prof.full_name as merchant_name
FROM public.digital_deliveries dd
JOIN public.orders o ON o.id = dd.order_id
JOIN public.products p ON p.id = o.product_id
JOIN public.customers c ON c.id = o.customer_id
JOIN public.profiles prof ON prof.id = o.merchant_id
WHERE dd.created_at > NOW() - INTERVAL '5 minutes'
ORDER BY dd.created_at DESC
LIMIT 5;
