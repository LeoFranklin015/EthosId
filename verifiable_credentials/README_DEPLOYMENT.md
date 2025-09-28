# Deploy to Render

## Quick Deploy Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "Add Render deployment config"
git push origin main
```

### 2. Connect to Render
1. Go to [render.com](https://render.com)
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Select the `verifiable_credentials` folder as the root directory

### 3. Configure Environment Variables
In Render dashboard, go to Environment tab and add:

```
INFURA_PROJECT_ID=your_infura_project_id_here
KMS_SECRET_KEY=your_kms_secret_key_here
NODE_ENV=production
PORT=3001
```

### 4. Deploy Settings
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Plan**: Free (or paid for better performance)

### 5. Deploy!
Click "Create Web Service" and Render will automatically:
- Install dependencies
- Start your service
- Give you a public URL like `https://your-app-name.onrender.com`

## Environment Variables

You need to set these in Render dashboard:

### Required:
- `INFURA_PROJECT_ID`: Get from [infura.io](https://infura.io)
- `KMS_SECRET_KEY`: Generate a secure random string (32+ characters)

### Optional:
- `NODE_ENV`: Set to `production`
- `PORT`: Render sets this automatically

## Testing Your Deployment

Once deployed, test your endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Issue a credential
curl -X POST https://your-app-name.onrender.com/issue-credential \
  -H "Content-Type: application/json" \
  -d '{
    "credentialSubject": {
      "id": "did:ens:test.eth",
      "name": "Test User"
    },
    "issuerAlias": "test-issuer"
  }'
```

## Notes

- **Free Plan**: Service sleeps after 15 minutes of inactivity
- **Database**: SQLite file persists between deployments
- **Logs**: Available in Render dashboard
- **Custom Domain**: Available on paid plans

## Troubleshooting

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Service Won't Start**: Check logs in Render dashboard
3. **Database Issues**: Ensure SQLite file is in the correct location
4. **Environment Variables**: Double-check they're set correctly in Render dashboard
