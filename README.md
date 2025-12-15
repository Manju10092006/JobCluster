# JobCluster

A comprehensive job search and resume analysis platform with ATS (Applicant Tracking System) integration.

## ⚠️ SECURITY WARNING

**❗ NEVER commit `.env` files to version control!**

All sensitive configuration (API keys, secrets, database URLs) must be stored in `.env` files, which are excluded from git. Always use `.env.example` files as templates.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or connection string)
- Redis (optional, for caching)
- RabbitMQ (optional, for background jobs)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd JobCluster
   ```

2. **Install root dependencies:**
   ```bash
   npm install
   ```

3. **Install server dependencies:**
   ```bash
   npm install --prefix server
   npm install --prefix auth-server
   npm install --prefix resume-server
   ```

4. **Set up environment variables:**

   For each server, copy the `.env.example` file to `.env` and fill in your actual values:

   ```bash
   # Root .env (for docker-compose)
   cp .env.example .env

   # Main server
   cp server/.env.example server/.env

   # Auth server
   cp auth-server/.env.example auth-server/.env

   # Resume server
   cp resume-server/.env.example resume-server/.env
   ```

   **Required environment variables:**

   - **Main Server (`server/.env`):**
     - `MONGODB_URI` - MongoDB connection string
     - `JWT_SECRET` - Secret key for JWT tokens (generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`)
     - `JOOBLE_API_KEY` or `JOB_API_KEY` - Jooble API key
     - `REDIS_URL` - Redis connection URL (optional)
     - `RABBITMQ_URL` - RabbitMQ connection URL (optional)

   - **Auth Server (`auth-server/.env`):**
     - `GOOGLE_CLIENT_ID` - Google OAuth client ID
     - `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
     - `SESSION_SECRET` - Session encryption secret
     - `JWT_SECRET` - JWT signing secret

   - **Resume Server (`resume-server/.env`):**
     - `MONGODB_URI` - MongoDB connection string
     - `REDIS_URL` - Redis connection URL (optional)
     - `JWT_SECRET` - JWT signing secret

5. **Start all servers:**
   ```bash
   npm start
   ```

   This will start:
   - Auth Server on `http://localhost:8000`
   - Main Server (Jobs API) on `http://localhost:5000`
   - Resume Server on `http://localhost:5001`

   Or start individually:
   ```bash
   npm start --prefix auth-server    # Port 8000
   npm start --prefix server         # Port 5000
   npm start --prefix resume-server  # Port 5001
   ```

## 🐳 Docker Setup

### Using Docker Compose

1. **Create `.env` file** (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Web application
   - Redis
   - RabbitMQ
   - Celery worker

3. **View logs:**
   ```bash
   docker-compose logs -f
   ```

4. **Stop services:**
   ```bash
   docker-compose down
   ```

### Docker Environment Variables

The `docker-compose.yml` file uses environment variables from `.env`. Ensure all required variables are set before starting.

**Important:** Never hardcode credentials in `docker-compose.yml`. Always use environment variables.

## 📁 Project Structure

```
JobCluster/
├── server/              # Main API server (Jobs, ATS, Dashboard)
├── auth-server/        # Authentication server (OAuth)
├── resume-server/      # Resume analysis server
├── client/             # Frontend application
├── docker-compose.yml  # Docker orchestration
├── .env.example        # Root environment template
└── README.md           # This file
```

## 🔐 Security Best Practices

1. **Environment Variables:**
   - Never commit `.env` files
   - Use `.env.example` as templates
   - Rotate secrets regularly
   - Use different secrets for dev/staging/production

2. **API Keys:**
   - Store all API keys in environment variables
   - Never hardcode keys in source code
   - Monitor API key usage
   - Implement rate limiting

3. **Database:**
   - Use strong passwords
   - Enable SSL/TLS in production
   - Restrict network access
   - Regular backups

4. **OAuth:**
   - Use different OAuth apps for dev/prod
   - Validate redirect URIs
   - Review app permissions regularly

## 🛠️ Development

### Running in Development Mode

```bash
npm run dev
```

This uses `nodemon` for auto-reload on file changes.

### API Endpoints

**Auth Server (`http://localhost:8000`):**
- `GET /auth/google` - Start Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/me` - Get current user
- `GET /health` - Health check

**Main Server (`http://localhost:5000`):**
- `POST /api/jobs/search` - Search jobs (Jooble API)
- `GET /api/jobs` - Get trending jobs
- `GET /api/saved-jobs` - Get saved jobs
- `POST /api/resume/ats` - Analyze resume
- `GET /health` - Health check

**Resume Server (`http://localhost:5001`):**
- `POST /api/resume/ats` - Analyze resume
- `GET /health` - Health check

## 📝 Environment Variables Reference

See `.env.example` files in each server directory for complete variable documentation.

### Generating Secure Secrets

**JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

**Session Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test
```

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure all tests pass
5. Submit a pull request

**Remember:** Never commit `.env` files or hardcoded secrets!

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**⚠️ Remember: Always keep your `.env` files secure and never commit them to version control!**

