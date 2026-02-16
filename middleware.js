// middleware.js — Vercel Edge Middleware for Prerender.io
// Works with any Vercel-deployed app (Vite, CRA, etc.)
// Intercepts requests from known bot/crawler user agents and proxies
// them to Prerender.io for fully-rendered HTML snapshots.

// Bot user agents that should receive pre-rendered pages
const BOT_AGENTS = [
    'googlebot',
    'bingbot',
    'yandex',
    'baiduspider',
    'facebookexternalhit',
    'twitterbot',
    'rogerbot',
    'linkedinbot',
    'embedly',
    'quora link preview',
    'showyoubot',
    'outbrain',
    'pinterest/0.',
    'pinterestbot',
    'developers.google.com/+/web/snippet',
    'slackbot',
    'vkshare',
    'w3c_validator',
    'redditbot',
    'applebot',
    'whatsapp',
    'flipboard',
    'tumblr',
    'bitlybot',
    'skypeuripreview',
    'nuzzel',
    'discordbot',
    'google page speed',
    'qwantify',
    'google-inspectiontool',
    'petalbot',
    'ahrefsbot',
    'semrushbot',
];

// File extensions to skip (static assets)
const IGNORED_EXTENSIONS = /\.(js|css|xml|less|png|jpg|jpeg|gif|pdf|ico|rss|zip|mp3|mp4|webp|webm|svg|woff|woff2|ttf|eot|map|json)$/i;

export default async function middleware(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Skip API routes and static assets
    if (pathname.startsWith('/api/') || IGNORED_EXTENSIONS.test(pathname)) {
        return;
    }

    const userAgent = request.headers.get('user-agent') || '';

    // Check if request is from a bot
    const isBot = BOT_AGENTS.some(bot =>
        userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    if (!isBot) {
        return;
    }

    // Proxy to Prerender.io
    const prerenderToken = process.env.PRERENDER_TOKEN;
    if (!prerenderToken) {
        console.warn('⚠️ PRERENDER_TOKEN not set. Serving normal SPA.');
        return;
    }

    try {
        const prerenderUrl = `https://service.prerender.io/${request.url}`;
        const prerenderResponse = await fetch(prerenderUrl, {
            headers: {
                'X-Prerender-Token': prerenderToken,
            },
            redirect: 'follow',
        });

        // Forward the pre-rendered HTML
        const body = await prerenderResponse.text();
        return new Response(body, {
            status: prerenderResponse.status,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'X-Prerender': 'true',
                'Cache-Control': 'public, max-age=86400', // Cache for 24h
            },
        });
    } catch (error) {
        console.error('Prerender.io proxy failed:', error.message);
        // Fall through to normal SPA rendering
        return;
    }
}

// Vercel Edge Middleware config
export const config = {
    matcher: [
        '/((?!_vercel|_next|icons|manifest\\.json|robots\\.txt|sitemap\\.xml|assets|favicon\\.ico).*)',
    ],
};
