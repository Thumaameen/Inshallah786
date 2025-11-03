
# 🔐 Render Environment Variables Setup Guide

## ⚠️ IMPORTANT: Add These in Render Dashboard (Don't Commit!)

Go to: **Render Dashboard → Your Service → Environment Tab**

### Step 1: Database (CRITICAL - Add This First!)

Click "Add Environment Variable" in Render and add:

```
Key: DATABASE_URL
Value: [Copy from your Render PostgreSQL database "Internal Database URL"]
```

**How to get the DATABASE_URL:**
1. Go to Render Dashboard → Databases → dha-production-db
2. Copy the **Internal Database URL** (starts with `postgresql://`)
3. Paste it as the value for DATABASE_URL

### Step 2: Blockchain RPC Endpoints

Add these in Render Environment tab:

```
Key: SOLANA_RPC_URL
Value: https://api.mainnet-beta.solana.com
(or use your Alchemy/Infura Solana endpoint if you have one)
```

```
Key: POLYGON_RPC_ENDPOINT
Value: https://polygon-rpc.com
(or use your Alchemy/Infura Polygon endpoint: https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY)
```

```
Key: ETHEREUM_RPC_URL
Value: https://eth.llamarpc.com
(or use your Infura endpoint: https://mainnet.infura.io/v3/YOUR_KEY)
```

### Step 3: Cloud Provider Keys (Optional)

#### AWS (if using AWS services):
```
Key: AWS_ACCESS_KEY_ID
Value: [Your AWS Access Key]

Key: AWS_SECRET_ACCESS_KEY
Value: [Your AWS Secret Key]

Key: AWS_REGION
Value: us-east-1
```

#### Azure (if using Azure services):
```
Key: AZURE_CLIENT_ID
Value: [Your Azure App Registration Client ID]

Key: AZURE_CLIENT_SECRET
Value: [Your Azure Client Secret]

Key: AZURE_TENANT_ID
Value: [Your Azure Tenant ID]

Key: AZURE_SUBSCRIPTION_ID
Value: [Your Azure Subscription ID]
```

#### Google Cloud Platform (if using GCP):
```
Key: GCP_PROJECT_ID
Value: [Your GCP Project ID]

Key: GCP_CLIENT_EMAIL
Value: [Your GCP Service Account Email]

Key: GCP_PRIVATE_KEY
Value: [Your GCP Private Key - keep the \n characters]
```

## 🚀 After Adding Variables

1. **Click "Save Changes"** in Render
2. Render will **automatically redeploy** with the new variables
3. Check the logs to confirm no errors

## ✅ Verification

After deployment completes, check your Render logs for:

```
✅ Database connection pool initialized
🔗 Blockchain Configuration:
  Ethereum: ✅ Configured
  Polygon: ✅ Configured
  Solana: ✅ Configured
```

## 📋 Current Status

Based on your screenshots, you need to add:
- ✅ DATABASE_URL (from Render PostgreSQL)
- ⚠️ SOLANA_RPC_URL
- ⚠️ POLYGON_RPC_ENDPOINT
- ⚠️ Cloud provider keys (if needed)

## 🔄 No Code Changes Required

All the code is now updated to gracefully handle missing environment variables. Just add them in Render's Environment tab and the service will automatically use them on the next deploy.

## 🆘 Troubleshooting

If deployment fails after adding variables:
1. Check that DATABASE_URL is exactly as copied from Render PostgreSQL
2. Remove any quotes around values
3. Make sure no trailing spaces in variable names or values
