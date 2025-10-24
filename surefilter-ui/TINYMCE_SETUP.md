# TinyMCE Setup

TinyMCE is used for rich text editing in the News & Events system.

## Getting a Free API Key

1. **Sign up** at https://www.tiny.cloud/auth/signup/
2. **Free plan includes:**
   - Unlimited localhost usage (127.0.0.1, localhost)
   - 1 approved production domain
   - Up to 1,000 loads per month
   - All core plugins

3. **Get your API key** from the TinyMCE Dashboard

## Configuration

### For Local Development

Add to your `.env` file in `surefilter-ui/`:

```bash
NEXT_PUBLIC_TINYMCE_API_KEY="your-api-key-here"
```

### For Production

Add to your production environment variables:

```bash
NEXT_PUBLIC_TINYMCE_API_KEY="your-api-key-here"
```

Also, approve your production domain in TinyMCE Dashboard:
- Go to https://www.tiny.cloud/my-account/domains/
- Add your domain (e.g., `new.surefilter.us`)

## Testing Without API Key

For testing, you can run without an API key, but you'll see a warning banner in the editor. The editor will still work with basic functionality.

## Alternative: Self-Hosted TinyMCE

If you prefer not to use the Cloud version, you can self-host TinyMCE:

1. Install: `npm install tinymce`
2. Configure to load from `node_modules`
3. No API key needed

However, the Cloud version is recommended for:
- Automatic updates
- Premium plugins access
- Better performance (CDN delivery)

