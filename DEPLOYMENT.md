# FoundIndex Deployment Guide

## ✅ Environment Variables Status

All required environment variables are already configured in Lovable Cloud:

- ✅ `SUPABASE_URL` - Auto-configured by Lovable Cloud
- ✅ `SUPABASE_PUBLISHABLE_KEY` - Auto-configured by Lovable Cloud  
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Auto-configured by Lovable Cloud
- ✅ `OPENAI_API_KEY` - Already set
- ✅ `OPENAI_MODEL_NAME` - Already set
- ✅ `AIRTABLE_API_KEY` - Already set
- ✅ `AIRTABLE_BASE_ID` - Already set

**Note**: This is a React/Vite project (not Next.js), so environment variables use `VITE_` prefix on the frontend, but Lovable handles this automatically.

## 🚀 Deployment Process

### 1. Frontend Deployment
- Click the **Publish** button in the top-right of Lovable
- Click "Update" in the publish dialog to deploy changes
- Your app will be live at your Lovable subdomain or custom domain

### 2. Backend Deployment (Edge Functions)
- Edge functions deploy **automatically** with your code
- No manual deployment needed
- Functions are available immediately after frontend deployment

## 🔍 Health Check Endpoint

Test if your backend is healthy:

```bash
# Replace with your actual Supabase URL
curl https://nvpoprqufydeozwpzbpm.supabase.co/functions/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-28T...",
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "supabaseUrl": true,
    "supabaseKey": true,
    "openaiKey": true,
    "airtableKey": true
  }
}
```

## ✅ Pre-Deployment Checklist

### Backend
- [x] All environment variables configured
- [x] Edge functions have CORS headers
- [x] Rate limiting implemented
- [x] Error handling in place
- [x] Logging configured
- [ ] Test health check endpoint
- [ ] Test all edge functions with real API keys

### Frontend
- [x] All pages load correctly
- [x] Mobile responsive design
- [x] Forms have validation
- [x] Loading states implemented
- [x] Error messages clear
- [x] Analytics tracking ready
- [ ] Test on iOS Safari
- [ ] Test on Android Chrome
- [ ] Test on slow 3G connection

### Database
- [x] RLS policies configured
- [x] Tables created with proper schemas
- [ ] Test rate limiting on database
- [ ] Verify data retention policies

### Testing
- [ ] Submit test form works
- [ ] Contact form sends emails
- [ ] Beta application form works
- [ ] Results page displays correctly
- [ ] Cookie consent works
- [ ] Navigation works on mobile

## 🔧 Post-Deployment Verification

1. **Test Health Check**:
   ```bash
   curl https://nvpoprqufydeozwpzbpm.supabase.co/functions/v1/health
   ```

2. **Test Main Flow**:
   - Visit homepage
   - Submit website URL
   - View results page
   - Check that recommendations load

3. **Test Contact Form**:
   - Fill out contact form
   - Verify email is sent to Airtable
   - Check success message displays

4. **Monitor Errors**:
   - Check browser console for errors
   - View Lovable Cloud logs for backend errors
   - Monitor rate limit warnings

## 🐛 Troubleshooting

### Edge Functions Not Working
1. Go to Lovable Cloud → Functions
2. Check function logs for errors
3. Verify environment variables are set
4. Test with health check endpoint

### Frontend Not Deploying
1. Check for TypeScript errors in console
2. Verify all imports are correct
3. Check that build completes successfully
4. Try clicking "Update" again in publish dialog

### Database Connection Issues
1. Verify Supabase project is running
2. Check RLS policies allow access
3. Test with Supabase dashboard query editor
4. Review edge function logs

## 📊 Monitoring

### Health Check
Monitor: `https://nvpoprqufydeozwpzbpm.supabase.co/functions/v1/health`

### Key Metrics to Track
- Website test submissions per day
- Contact form submissions
- Beta applications
- Error rates
- Page load times
- Mobile vs desktop usage

## 🔐 Security Notes

- All API keys stored as Lovable Cloud secrets
- RLS policies enforce data access rules
- CORS configured for web app access only
- Rate limiting prevents abuse
- No sensitive data in frontend code

## 📝 Custom Domain Setup

To add a custom domain:
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as shown
4. Wait for SSL certificate (5-15 minutes)

## 🆘 Support

If you encounter issues:
1. Check Lovable Cloud logs
2. Review edge function logs
3. Test health check endpoint
4. Contact support if needed

---

**Last Updated**: January 2025
**Project**: FoundIndex v1.0.0
