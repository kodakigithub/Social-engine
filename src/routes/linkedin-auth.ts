import type { FastifyInstance } from 'fastify';
import { config } from '../config.js';

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';

export async function linkedInAuthRoutes(app: FastifyInstance) {
  // Step 1: Redirect to LinkedIn OAuth
  app.get('/auth/linkedin', async (request, reply) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    
    if (!clientId) {
      return reply.status(500).send({
        error: 'LINKEDIN_CLIENT_ID not configured',
      });
    }

    const redirectUri = `http://${config.HOST}:${config.PORT}/auth/linkedin/callback`;
    const state = Buffer.from(Math.random().toString()).toString('base64');

    // Store state in a simple way (in production, use Redis/session)
    const authUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=w_member_social,r_liteprofile`;

    return reply.redirect(authUrl);
  });

  // Step 2: Handle callback from LinkedIn
  app.get('/auth/linkedin/callback', async (request, reply) => {
    const { code, error, error_description } = request.query as any;

    if (error) {
      return reply.status(400).send({
        error: 'LinkedIn authorization failed',
        details: error_description,
      });
    }

    if (!code) {
      return reply.status(400).send({
        error: 'Authorization code not received',
      });
    }

    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return reply.status(500).send({
        error: 'LinkedIn credentials not configured',
      });
    }

    const redirectUri = `http://${config.HOST}:${config.PORT}/auth/linkedin/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch(LINKEDIN_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      return reply.status(400).send({
        error: 'Failed to exchange code for token',
        details: errorText,
      });
    }

    const tokenData = await tokenResponse.json();

    return reply.send({
      success: true,
      accessToken: tokenData.access_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
    });
  });
}
