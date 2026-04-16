# Setup Guide - AI Handler

This guide walks through setting up AI Handler with Supabase auth, Paddle payments, and OpenAI integration.

## Prerequisites

- Supabase project created
- Paddle Billing account
- OpenAI API key
- Netlify deployment

---

## 1. Supabase Configuration

### 1.1 Get Your Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings > API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

### 1.2 Enable Email/Password Authentication

1. In Supabase, go to **Authentication > Providers**
2. Find **Email**
3. Enable it and make sure "Email" is checked

### 1.3 Configure OAuth (Google & GitHub)

#### For Google:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Go to **APIs & Services > Credentials**
4. Create **OAuth 2.0 Client ID** (Web application)
5. Add authorized redirect URIs:
   - `https://[PROJECT_ID].supabase.co/auth/v1/callback`
   - `https://yourdomain.com/auth/v1/callback`
6. Copy Client ID and Secret
7. In Supabase > Authentication > Providers > Google:
   - Paste Client ID and Secret
   - Enable it

#### For GitHub:
1. Go to GitHub > Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Set Authorization callback URL:
   - `https://[PROJECT_ID].supabase.co/auth/v1/callback`
4. Copy Client ID and Secret
5. In Supabase > Authentication > Providers > GitHub:
   - Paste Client ID and Secret
   - Enable it

### 1.4 Set Redirect URLs

In Supabase > Authentication > URL Configuration:

Add Site URLs:
- `http://localhost:3000` (for local development)
- `https://yourdomain.com` (your production domain)

Redirect URLs (Post sign-in):
- `http://localhost:3000/**`
- `https://yourdomain.com/**`

---

## 2. OpenAI Configuration

### Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key in **API Keys** section
3. Copy the key → `OPENAI_API_KEY`

**Note**: The model defaults to `gpt-4o-mini` (most cost-effective).

---

## 3. Paddle Payments Configuration

### 3.1 Get Credentials

1. Go to [Paddle Dashboard](https://dashboard.paddle.com)
2. Go to **Settings > Authentication > API keys**
   - Copy API key → `PADDLE_API_KEY`
3. Go to **Settings > Authentication > Client-side tokens**
   - Copy token → `NEXT_PUBLIC_PADDLE_TOKEN`
4. Go to **Webhooks** (Settings > Developers)
   - Create webhook for your Netlify domain
   - Subscribe to:
     - `transaction.completed`
     - `subscription.activated`
     - `subscription.updated`
     - `subscription.canceled`
   - Copy webhook secret → `PADDLE_WEBHOOK_SECRET`

### 3.2 Create Price IDs

1. Go to **Products** in Paddle
2. Create prices for coins:
   - 50 coins → `NEXT_PUBLIC_PADDLE_PRICE_COINS_50`
   - 200 coins → `NEXT_PUBLIC_PADDLE_PRICE_COINS_200`
   - 500 coins → `NEXT_PUBLIC_PADDLE_PRICE_COINS_500`
3. Create price for Pro subscription:
   - Monthly plan → `NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY`

### 3.3 Set Paddle Webhook URL

In Paddle Dashboard > Webhooks:

Add webhook endpoint:
```
https://yourdomain.netlify.app/.netlify/functions/paddle-webhook
```

Enable these events:
- transaction.completed
- subscription.activated
- subscription.updated
- subscription.canceled

---

## 4. Netlify Environment Setup

### 4.1 Add Environment Variables

In Netlify Dashboard > Site settings > Build & deploy > Environment:

Add these variables:

**Supabase:**
- `NEXT_PUBLIC_SUPABASE_URL` = your project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key
- `SUPABASE_SERVICE_ROLE_KEY` = service role key

**OpenAI:**
- `OPENAI_API_KEY` = your API key
- `OPENAI_MODEL` = `gpt-4o-mini` (optional, defaults if not set)

**Paddle:**
- `NEXT_PUBLIC_PADDLE_TOKEN` = client-side token
- `NEXT_PUBLIC_PADDLE_PRICE_COINS_50` = price ID
- `NEXT_PUBLIC_PADDLE_PRICE_COINS_200` = price ID
- `NEXT_PUBLIC_PADDLE_PRICE_COINS_500` = price ID
- `NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY` = price ID
- `PADDLE_API_KEY` = server API key
- `PADDLE_WEBHOOK_SECRET` = webhook secret
- `PADDLE_PRICE_COINS_MAP` = `{"pri_xxxxx":50,"pri_yyyyy":200,"pri_zzzzz":500}`

**Admin:**
- `ADMIN_EMAILS` = `admin@example.com,support@example.com` (comma-separated)

**Analytics (optional):**
- `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID` = your GA4 measurement ID

### 4.2 Trigger Deploy

1. After setting all variables, go to **Deploys**
2. Click **Trigger deploy** to redeploy with new environment variables

---

## 5. Database Setup

### 5.1 Create `profiles` Table

In Supabase SQL Editor, run:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  coins INT DEFAULT 0,
  usage_count INT DEFAULT 0,
  subscription_status TEXT DEFAULT 'none',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### 5.2 Create RPC Functions

```sql
-- Increment usage count
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Deduct coins
CREATE OR REPLACE FUNCTION deduct_coins(p_user_id UUID, p_amount INT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET coins = coins - p_amount,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add coins
CREATE OR REPLACE FUNCTION add_coins(p_user_id UUID, p_amount INT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET coins = coins + p_amount,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update subscription
CREATE OR REPLACE FUNCTION update_subscription(p_user_id UUID, p_status TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET subscription_status = p_status,
      updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Testing

### Local Development

1. Copy `.env.example` to `.env.local`
2. Fill in all values from above
3. Run: `npm run dev`
4. Test login/signup at `http://localhost:3000`

### Production (Netlify)

1. Verify all env vars are set in Netlify
2. Trigger a deploy
3. Test at your production domain
4. Check browser console (F12) for errors

---

## Troubleshooting

### "Auth service not configured" error
→ NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY missing in Netlify environment

### OAuth buttons don't work
→ Check Supabase > Authentication > Providers settings
→ Verify OAuth apps are created and credentials are correct
→ Check redirect URLs in Supabase match your domain

### Email signup fails
→ Enable Email provider in Supabase > Authentication > Providers
→ Check email is valid (not temporary email)

### Paddle checkout doesn't work
→ NEXT_PUBLIC_PADDLE_TOKEN not set
→ Check Paddle SDK is loading in browser console

### Login form doesn't respond
→ Check browser console (F12) for JavaScript errors
→ Verify Supabase can be reached (not CORS blocked)
→ Check network tab in DevTools for failed API calls

### AI generation fails
→ OPENAI_API_KEY not set in Netlify
→ Check API key is valid and has available quota
→ Check rate limits aren't exceeded

---

## Support

For issues:
1. Check browser console for error messages
2. Check Netlify function logs
3. Verify all environment variables are set
4. Ensure database tables and functions exist
