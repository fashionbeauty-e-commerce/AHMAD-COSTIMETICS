// Request logger middleware
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Audit log middleware for admin actions
export const auditLog = (action) => {
  return (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log admin action
      console.log('AUDIT:', {
        action,
        user: req.user?._id,
        email: req.user?.email,
        role: req.user?.role,
        path: req.originalUrl,
        method: req.method,
        status: res.statusCode,
        timestamp: new Date().toISOString(),
        ip: req.ip
      });
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};
