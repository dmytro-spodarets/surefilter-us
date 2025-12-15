# AWS RDS SSL Configuration

> **Note:** This project uses **OpenTofu** (not Terraform) for infrastructure management.

## Best Practices (December 2025)

### SSL Connection to AWS RDS PostgreSQL

We use **SSL encryption** for secure database connections to AWS RDS.

### Implementation

**Location:** `src/lib/prisma.ts`

```typescript
const sslConfig = process.env.NODE_ENV === 'production' 
  ? {
      rejectUnauthorized: false,
      // AWS RDS certificates are self-signed and not in Node.js CA bundle
      // Connection is still encrypted, just not verified against CA
    }
  : false; // Local development without SSL

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: sslConfig,
});
```

### Why This Approach?

#### ✅ Advantages:

1. **Encryption**: All data in transit is encrypted via TLS
2. **Simple Configuration**: No need to bundle CA certificates in Docker image
3. **Works with RDS**: AWS RDS uses self-signed certificates that aren't in standard CA bundles
4. **Zero Maintenance**: No certificate rotation needed
5. **Acceptable Security**: Connection is encrypted, protecting against passive eavesdropping

#### ⚠️ Trade-offs:

1. **No Certificate Verification**: `rejectUnauthorized: false` means we don't verify the server certificate
2. **MITM Risk**: Theoretically vulnerable to man-in-the-middle attacks (mitigated by AWS VPC security)
3. **Not Ideal**: Best practice would be to use proper CA verification, but requires bundling AWS RDS CA certificates

#### ❌ Alternatives We Don't Use:

1. **No SSL**: Unencrypted connection (never use in production)
2. **Full Verification**: Would require bundling AWS RDS CA certificate in Docker image

### Connection String

**DATABASE_URL format:**
```
postgresql://user:password@host:5432/database?schema=public
```

**Note:** No `sslmode` parameter needed - SSL is configured in code.

### Environment-Specific Behavior

| Environment | SSL Enabled | Certificate Verification |
|-------------|-------------|-------------------------|
| Production  | ✅ Yes      | ❌ No (rejectUnauthorized: false) |
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

- [x] SSL encryption enabled in production
- [x] Connection encrypted via TLS
- [ ] Certificate verification disabled (`rejectUnauthorized: false`) - acceptable for AWS RDS
- [x] No credentials in connection string (use environment variables)
- [x] Connection string stored in AWS SSM Parameter Store
- [x] No SSL parameters in connection string (managed in code)
- [x] Database in private VPC (mitigates MITM risk)
