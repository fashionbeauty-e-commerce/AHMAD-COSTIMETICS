/**
 * Cloudinary Upload Routes
 * Handles secure operations like deletion (requires API secret)
 */

import express from 'express';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * POST /api/upload/delete
 * Delete file from Cloudinary (admin only)
 */
router.post('/delete', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete file',
    });
  }
});

/**
 * POST /api/upload/sign
 * Generate signed upload signature (for sensitive uploads)
 */
router.post('/sign', async (req, res) => {
  try {
    const { folder = 'ahmad-costimetics', publicId } = req.body;
    
    const timestamp = Math.round(Date.now() / 1000);
    const params = {
      timestamp,
      folder,
      ...(publicId && { public_id: publicId }),
    };

    const signature = cloudinary.utils.api_sign_request(
      params,
      process.env.CLOUDINARY_API_SECRET
    );

    res.json({
      success: true,
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/upload/info/:publicId
 * Get image metadata
 */
router.get('/info/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await cloudinary.api.resource(publicId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * POST /api/upload/transform
 * Generate transformed URLs
 */
router.post('/transform', (req, res) => {
  try {
    const { publicId, transformations } = req.body;
    
    const url = cloudinary.url(publicId, transformations);
    
    res.json({
      success: true,
      url,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
