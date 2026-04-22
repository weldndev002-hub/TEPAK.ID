import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request, locals }) => {
    const envKeys = locals.runtime?.env ? Object.keys(locals.runtime.env) : [];
    const directEnvKeys = (locals as any).env ? Object.keys((locals as any).env) : [];
    
    return new Response(JSON.stringify({
        status: 'online',
        message: 'Astro API Test',
        runtime_env_keys: envKeys,
        direct_env_keys: directEnvKeys,
        has_supabase_url: !!(locals.runtime?.env?.PUBLIC_SUPABASE_URL || (locals as any).env?.PUBLIC_SUPABASE_URL),
        timestamp: new Date().toISOString()
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};
