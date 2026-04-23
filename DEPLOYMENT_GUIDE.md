# CausalAI Production Deployment Guide

## 🚀 Quick Deployment Steps

### 1. Deploy to Render

1. **Connect your GitHub repository** to Render
2. **Create the services** using the `render.yaml` configuration
3. **Wait for deployment** (5-10 minutes)

### 2. Service URLs

Once deployed, your services will be available at:

- **Frontend**: https://causalai-frontend.onrender.com
- **Backend API**: https://causalai-backend.onrender.com
- **ML Service**: https://causalai-ml.onrender.com

### 3. Verify Deployment

Check each service health:

```bash
# Frontend
curl https://causalai-frontend.onrender.com

# Backend Health
curl https://causalai-backend.onrender.com/api/health

# ML Service Health  
curl https://causalai-ml.onrender.com/health
```

## 🔧 Configuration Details

### Backend Environment Variables
- `NODE_ENV`: production
- `PORT`: 5000
- `MONGO_URI`: MongoDB Atlas connection string
- `JWT_SECRET`: Production JWT secret
- `AI_SERVICE_URL`: https://causalai-ml.onrender.com/analyze

### Frontend Configuration
- Build with Vite
- Static hosting on Render
- API URL configured for production

### ML Service Configuration
- Flask app with CORS enabled
- Runs on port 8000
- Health check endpoint available

## 🧪 Testing the Application

### 1. Create Account
1. Visit https://causalai-frontend.onrender.com
2. Register a new account
3. Login to the dashboard

### 2. Upload Dataset
1. Navigate to Upload page
2. Use sample data from `sample-data/sales-sample.csv`
3. Verify successful upload

### 3. Run Analysis
1. Go to Analysis page
2. Select uploaded dataset
3. Choose target column
4. Run root cause analysis
5. Test what-if scenarios

## 🐛 Troubleshooting

### Common Issues

1. **Service Not Ready**
   - Wait 2-3 minutes after deployment
   - Check Render dashboard for service status

2. **API Connection Errors**
   - Verify ML service is running
   - Check backend logs for connection errors

3. **Database Connection Issues**
   - Verify MongoDB URI is correct
   - Check network access permissions

### Health Checks

```bash
# Check all services
curl -I https://causalai-frontend.onrender.com
curl -I https://causalai-backend.onrender.com/api/health
curl -I https://causalai-ml.onrender.com/health
```

## 📊 Monitoring

### Render Dashboard
- Monitor service logs
- Check response times
- Track error rates

### Manual Testing
- Test user registration/login
- Verify file upload functionality
- Validate ML analysis results

## 🔄 Updates

To update the application:
1. Push changes to GitHub main branch
2. Render will automatically redeploy
3. Wait for deployment completion
4. Test updated functionality

## 📞 Support

If issues persist:
1. Check Render service logs
2. Verify environment variables
3. Test individual services
4. Check GitHub Actions status
