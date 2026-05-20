/**
 * Clerk Authentication Middleware
 * Verifies Clerk session tokens on the backend
 */

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || 'sk_test_pe3czBDcvwV3hhjH4osK26ywotv92TQ7MCsGZBlJrq';
const CLERK_API_URL = 'https://api.clerk.com/v1';

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'fashionbeauty101f@gmail.com,konkcee@gmail.com')
  .split(',')
  .map(e => e.trim().toLowerCase());

/**
 * Verify Clerk session token by calling Clerk's API
 */
export async function verifyClerkToken(token) {
  if (!token) {
    throw new Error('No token provided');
  }

  try {
    const response = await fetch(`${CLERK_API_URL}/sessions/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    return await response.json();
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
}

/**
 * Get user details from Clerk
 */
export async function getClerkUser(userId) {
  try {
    const response = await fetch(`${CLERK_API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${CLERK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('User not found');
    }

    return await response.json();
  } catch (error) {
    console.error('Get user failed:', error);
    throw error;
  }
}

/**
 * Middleware: Require authenticated user
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
      });
    }

    const token = authHeader.split(' ')[1];
    const session = await verifyClerkToken(token);
    
    if (!session || !session.user_id) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session'
      });
    }

    // Get user details
    const user = await getClerkUser(session.user_id);
    
    req.user = {
      id: user.id,
      email: user.email_addresses[0]?.email_address,
      firstName: user.first_name,
      lastName: user.last_name,
      imageUrl: user.image_url,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Middleware: Require admin access
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // First check authentication
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userEmail = req.user.email?.toLowerCase();
    
    if (!ADMIN_EMAILS.includes(userEmail)) {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Authorization failed'
    });
  }
};

/**
 * Middleware: Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const session = await verifyClerkToken(token);
        if (session && session.user_id) {
          const user = await getClerkUser(session.user_id);
          req.user = {
            id: user.id,
            email: user.email_addresses[0]?.email_address,
            firstName: user.first_name,
            lastName: user.last_name,
          };
        }
      } catch (error) {
        // Ignore - user is just not authenticated
      }
    }

    next();
  } catch (error) {
    next();
  }
};
