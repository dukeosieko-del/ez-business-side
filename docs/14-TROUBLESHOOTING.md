# Troubleshooting

## Build fails
- Check env vars are set
- Run npm install
- Check TypeScript: npx tsc --noEmit

## Database connection errors
- Verify Supabase URL and keys
- Check network connectivity
- Verify migrations ran

## Auth failures
- Verify SSO configuration
- Check cookie settings
- Verify HMAC_SECRET