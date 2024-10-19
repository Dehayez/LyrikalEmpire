export function isAuthPage(pathname) {
    return pathname === '/login' || 
           pathname === '/register' || 
           pathname === '/confirm-wait' || 
           pathname.startsWith('/confirm/') || 
           pathname === '/resend-confirmation' || 
           pathname === '/request-password-reset' || 
           pathname.startsWith('/reset-password/');
};