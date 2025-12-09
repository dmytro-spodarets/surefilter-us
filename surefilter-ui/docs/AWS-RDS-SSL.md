# AWS RDS SSL Configuration

> **Note:** This project uses **OpenTofu** (not Terraform) for infrastructure management.

## Best Practices (December 2025)

### SSL Connection to AWS RDS PostgreSQL

We use **SSL with certificate verification** for secure database connections.

### Implementation

**Location:** `src/lib/prisma.ts`

```typescript
const sslConfig = process.env.NODE_ENV === 'production' 
  ? {
      rejectUnauthorized: true,
      // AWS RDS uses Amazon Root CA, trusted by Node.js by default
    }
  : false; // Local development without SSL

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});
```

### Why This Approach?

#### ✅ Advantages:

1. **Certificate Verification**: `rejectUnauthorized: true` validates the server certificate
2. **No Manual CA File**: AWS RDS certificates are signed by Amazon Root CA, which is included in Node.js system CA certificates
3. **MITM Protection**: Prevents man-in-the-middle attacks
4. **Compliance**: Meets security best practices for production databases
5. **Zero Configuration**: No need to download or bundle RDS CA certificates

#### ❌ Alternatives We Don't Use:

1. **`sslmode=no-verify`**: Encrypts but doesn't verify certificate (vulnerable to MITM)
2. **`sslmode=require`**: Same as no-verify in pg driver
3. **No SSL**: Unencrypted connection (never use in production)

### Connection String

**DATABASE_URL format:**
```
postgresql://user:password@host:5432/database?schema=public
```

**Note:** No `sslmode` parameter needed - SSL is configured in code.

### Environment-Specific Behavior

| Environment | SSL Enabled | Certificate Verification |
|-------------|-------------|-------------------------|
| Production  | ✅ Yes      | ✅ Yes                  |
| Development | ❌ No       | N/A                     |

### AWS RDS Certificate Chain

AWS RDS PostgreSQL uses certificates signed by:
- **Amazon Root CA 1** (RSA 2048, SHA256)
- Trusted by all major operating systems and Node.js

### References

- [AWS RDS SSL Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/PostgreSQL.Concepts.General.SSL.html)
- [node-postgres SSL Documentation](https://node-postgres.com/features/ssl)
- [Node.js TLS Documentation](https://nodejs.org/api/tls.html)

### Troubleshooting

**Error: `self-signed certificate in certificate chain`**
- Cause: `rejectUnauthorized: true` without proper CA
- Solution: AWS RDS certificates should work automatically. If not, check Node.js version (requires v14+)

**Error: `User was denied access on the database`**
- Cause: Missing SSL connection when RDS requires it
- Solution: Ensure `ssl` config is properly set in Pool

### Security Checklist

- [x] SSL enabled in production
- [x] Certificate verification enabled (`rejectUnauthorized: true`)
- [x] No credentials in connection string (use environment variables)
- [x] Connection string stored in AWS SSM Parameter Store
- [x] No SSL parameters in connection string (managed in code)
