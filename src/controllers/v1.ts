/**
 * @fileoverview Version 1 API router implementation.
 * This file contains the router configuration for version 1 of the API.
 * @module v1
 */

import express from 'express';
import { ExpressMiddleware } from '../types';
import { authenticated } from '@/core/common/authentication';

const router = express.Router();

/**
 * Endpoint for retrieving tenant information
 * @route GET /api/v1/tenants/:tenantId
 * @param {string} tenantId - The unique identifier of the tenant
 * @middleware authenticated - Ensures request is authenticated
 * @returns {Object} JSON response containing tenant information
 */
router.get(
  '/api/v1/tenants/:tenantId',
  authenticated,
  // authorizeMultiple(isAdmin, isManager),
  (req, res) => {
    const { tenantId } = req.params;
    res.status(200).json({ message: `Tenant ID: ${tenantId}` });
  }
);

/**
 * Express middleware for version 1 API routes
 * @type {ExpressMiddleware}
 */
export const v1: ExpressMiddleware = router;
