import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isArchitectRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/projects(.*)'
]);

const isClientRoute = createRouteMatcher([
    '/portal(.*)'
]);

const isProtectedRoute = createRouteMatcher([
    '/dashboard(.*)',
    '/projects(.*)',
    '/portal(.*)',
    '/api/(?!webhooks/clerk)(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
    if (isProtectedRoute(req)) {
        await auth.protect();
    }

    const authObject = await auth();
    const { orgRole } = authObject;

    // Intercept client trying to access architect routes
    if (isArchitectRoute(req)) {
        // If not an admin/architect, force them to the client portal
        if (orgRole && orgRole !== 'org:admin') {
            const url = new URL(req.url);
            const match = url.pathname.match(/^\/projects\/([^\/]+)/);
            if (match) {
                return NextResponse.redirect(new URL(`/portal/${match[1]}/dashboard`, req.url));
            }
            return NextResponse.redirect(new URL('/portal', req.url));
        }
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};