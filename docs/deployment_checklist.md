# Final Deployment Checklist

Before deploying to production, ensure the following are completed and verified:

- [ ] Environment variables securely stored (use secret manager or CI secrets)
  - `DATABASE_URL` or `PG*` variables
  - `JWT_SECRET`
  - Any external API keys
- [ ] Database migrations in place (use a migration tool like Flyway, Liquibase, or Knex)
- [ ] Run full test suite (backend unit/integration + frontend E2E)
- [ ] Build artifacts validated:
  - Backend: container image builds successfully
  - Frontend: production build outputs served correctly
- [ ] Health checks and readiness probes configured
- [ ] Configure logging & monitoring (application logs, error reporting)
- [ ] HTTPS is configured (TLS certs)
- [ ] CORS allowed origins set to production domains
- [ ] Secrets not committed in repository
- [ ] Backup strategy for DB
- [ ] Load testing / performance profiling in staging
- [ ] Security scan for dependencies (Snyk / npm audit)

Deployment commands (example with docker-compose):

```bash
docker-compose build
docker-compose up -d
```

Post-deploy verification:

- Hit `/health` endpoint
- Perform a smoke test: login, create application, view analytics
- Confirm logs and metrics reporting
