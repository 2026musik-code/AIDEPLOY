# AI WORKER - Cloudflare Deployer

A modern, high-end web application to generate and deploy Cloudflare Workers using Gemini AI.

## Features
- **AI Code Generation**: Uses Gemini 1.5/2.0 to write worker code.
- **Auto-Fix**: Automatically detects and fixes deployment errors using AI.
- **Worker Management**: List, Delete, and Edit existing workers.
- **Custom Domains**: Assign custom domains to your workers.
- **Mobile Responsive**: Luxury design that works perfectly on mobile.

## Deployment to Cloudflare Workers

This project is ready to be deployed to your own Cloudflare account.

### Prerequisites
1. [Bun](https://bun.sh) installed.
2. [Cloudflare Account](https://dash.cloudflare.com).

### Steps to Deploy
1. **Clone the repository.**
2. **Install dependencies:**
   ```bash
   bun install
   ```
3. **Build the frontend (IMPORTANT):**
   ```bash
   bun run build
   ```
4. **Login to Cloudflare:**
   ```bash
   npx wrangler login
   ```
5. **Deploy:**
   ```bash
   bun run deploy
   ```

**Note:** If you run `npx wrangler deploy` directly, make sure you have already run `bun run build`.

The project uses Cloudflare's new `assets` feature to serve the frontend and the Hono API in a single worker.

## Environment Variables
The application asks for your Cloudflare credentials and Gemini API Key at runtime (stored in your browser's local storage) to ensure your keys stay private.

- **Cloudflare Email**
- **Cloudflare API Token** (with Workers and Zones permissions)
- **Cloudflare Account ID**
- **Gemini API Key**
