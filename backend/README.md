# Backend

This backend exposes an Express API on port `5000` by default.

Development start (will free the port 5000 on Linux before starting):

```bash
cd backend
npm run dev
```

Notes:
- The `predev` script runs `fuser -k 5000/tcp` to free the port on Linux. If you prefer not to kill processes automatically, set a different port before starting:

```bash
PORT=5001 npm run dev
```

- You can also start the server in production mode with `npm start`.
