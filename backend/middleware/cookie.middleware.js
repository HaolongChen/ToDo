// Middleware to ensure consistent cookie handling across development and production
export const cookieCleanupMiddleware = (req, res, next) => {
    // Store original cookie method
    const originalCookie = res.cookie;
    
    // Override cookie method to add cleanup logic
    res.cookie = function(name, value, options = {}) {
        // If we're setting a jwt cookie and there's already one, clear it first
        if (name === 'jwt' && value && value !== '') {
            // Clear existing cookies with different configurations
            const clearOptions = { ...options, maxAge: 0 };
            
            // Try clearing with domain
            if (clearOptions.domain) {
                originalCookie.call(this, name, '', clearOptions);
            }
            
            // Try clearing without domain
            const noDomainOptions = { ...clearOptions };
            delete noDomainOptions.domain;
            originalCookie.call(this, name, '', noDomainOptions);
            
            // Try clearing with localhost domain (for development)
            if (process.env.MODE === 'development') {
                originalCookie.call(this, name, '', { ...clearOptions, domain: 'localhost' });
                originalCookie.call(this, name, '', { ...clearOptions, domain: '.localhost' });
            }
        }
        
        // Set the actual cookie
        return originalCookie.call(this, name, value, options);
    };
    
    next();
};

// Middleware to add CORS headers for cookie handling
export const cookieCorsMiddleware = (req, res, next) => {
    // Add headers to help with cross-origin cookie handling
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Expose-Headers', 'Set-Cookie');
    
    next();
};