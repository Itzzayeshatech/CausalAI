# CausalAI v2.0 - Production-Grade SaaS Analytics Platform

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js** 18+ 
- **Python** 3.8+
- **MongoDB** 5.0+
- **Git** for version control

### 1. Clone & Setup
```bash
git clone https://github.com/Itzzayeshatech/CausalAI.git
cd CausalAI
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 3. AI Service Setup
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 5. Database Setup
```bash
# Start MongoDB
mongod

# Or use Docker
docker run -d -p 27017:27017 mongo:7.0
```

## 🌐 Access URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000
- **API Documentation**: http://localhost:5000/api-docs

## 🔑 Default Credentials

**Admin Account:**
- Email: `admin@causalai.com`
- Password: `admin123`

## 📊 Sample Datasets

Located in `sample-data/`:
- `comprehensive-sales-data.csv` - 90 rows, 11 columns
- `customer-behavior-data.csv` - 80 rows, 11 columns  
- `operational-metrics-data.csv` - 90 rows, 12 columns

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend     │    │   Backend      │    │   AI Service   │
│   (React)      │◄──►│   (Node.js)    │◄──►│   (Python)     │
│                │    │                │    │                │
│ - Dashboard    │    │ - REST API     │    │ - ML Models    │
│ - Charts       │    │ - Auth         │    │ - Analytics    │
│ - Insights     │    │ - Validation   │    │ - Predictions  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (MongoDB)    │
                    │                │
                    │ - Datasets      │
                    │ - Users         │
                    │ - Analysis      │
                    └─────────────────┘
```

## 🆕 What's New in v2.0

### 🔥 Real Machine Learning
- **Advanced Correlation Analysis**: Pearson & Spearman correlation
- **Multiple Regression Models**: Linear, Ridge, Lasso, Random Forest, Gradient Boosting
- **Feature Importance**: SHAP-like importance scoring
- **Statistical Validation**: P-values, confidence intervals

### 🧠 AI Insights Engine
- **Dynamic Business Insights**: Auto-generated recommendations
- **Risk Analysis**: Identify potential business risks
- **Opportunity Detection**: Highlight growth opportunities
- **KPI Monitoring**: Real-time performance metrics

### 🎨 SaaS-Level UI
- **Modern Dashboard**: Enterprise-grade interface
- **Interactive Charts**: Multiple chart types (Line, Bar, Area, Scatter, Pie)
- **KPI Cards**: Real-time metrics with trends
- **Insight Panels**: Tabbed AI-generated insights
- **Responsive Design**: Mobile-friendly interface

### 🛡️ Production Features
- **Data Pipeline**: Validation, cleaning, preprocessing
- **Error Handling**: Comprehensive error management
- **Performance Optimization**: Caching, pagination, async processing
- **Security**: JWT auth, role-based access, input validation

## 📋 API Endpoints

### Authentication
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
GET  /api/auth/profile       - User profile
```

### Datasets
```
POST /api/datasets/upload   - Upload dataset
GET  /api/datasets          - List datasets (paginated)
GET  /api/datasets/:id        - Get dataset details
PUT  /api/datasets/:id        - Update dataset
DELETE /api/datasets/:id        - Delete dataset
```

### Analysis
```
POST /api/analysis/root-cause  - Root cause analysis
POST /api/analysis/what-if     - What-if simulation
GET  /api/analysis/history     - Analysis history
```

### Admin
```
GET /api/admin/users         - User management
GET /api/admin/analytics     - System analytics
GET /api/admin/health        - System health
```

## 🔧 Configuration

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/causalai
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRES_IN=7d
UPLOAD_DIR=uploads
AI_SERVICE_URL=http://localhost:8000/analyze
MAX_FILE_SIZE=52428800
```

### AI Service
```env
AI_SERVICE_HOST=0.0.0.0
AI_SERVICE_PORT=8000
AI_SERVICE_DEBUG=false
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run all services
docker-compose up --build

# Run in background
docker-compose up -d
```

### Production Environment
```bash
# Set production environment
export NODE_ENV=production
export AI_SERVICE_DEBUG=false

# Use PM2 for process management
pm2 start ecosystem.config.js
```

## 📊 Usage Examples

### Upload Dataset
```javascript
const formData = new FormData();
formData.append('file', csvFile);
formData.append('name', 'Sales Data');
formData.append('description', 'Monthly sales metrics');

const response = await api.post('/datasets/upload', formData);
```

### Root Cause Analysis
```javascript
const analysis = await api.post('/analysis/root-cause', {
  datasetId: 'dataset_id_here',
  targetColumn: 'Sales'
});

// Response includes:
// - Correlation matrix
// - Regression coefficients
// - Feature importance
// - AI-generated insights
// - Business recommendations
```

### What-If Simulation
```javascript
const simulation = await api.post('/analysis/what-if', {
  datasetId: 'dataset_id_here',
  targetColumn: 'Revenue',
  scenarioName: 'Marketing Increase',
  changes: [
    {
      variable: 'MarketingSpend',
      deltaPercent: 20
    }
  ]
});
```

## 🔍 Monitoring & Debugging

### Health Checks
```bash
# Backend health
curl http://localhost:5000/api/health

# AI Service health
curl http://localhost:8000/health

# Frontend status
curl http://localhost:3000
```

### Logs
```bash
# Backend logs
tail -f backend/logs/app.log

# AI Service logs
tail -f ai-service/logs/ml.log

# Database logs
mongod --logpath /var/log/mongodb.log
```

## 🛠️ Troubleshooting

### Common Issues

**1. Port Conflicts**
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

**2. Database Connection**
```bash
# Check MongoDB status
systemctl status mongod

# Restart MongoDB
systemctl restart mongod
```

**3. File Upload Issues**
```bash
# Check uploads directory permissions
ls -la backend/uploads/

# Create uploads directory if missing
mkdir -p backend/uploads
chmod 755 backend/uploads
```

## 📈 Performance Optimization

### Database Indexes
```javascript
// MongoDB indexes for performance
db.datasets.createIndex({ "user": 1, "uploadDate": -1 })
db.analyses.createIndex({ "user": 1, "createdAt": -1 })
```

### Caching Strategy
```javascript
// Redis caching for analysis results
const cacheKey = `analysis:${datasetId}:${targetColumn}`;
const cachedResult = await redis.get(cacheKey);
```

### Async Processing
```javascript
// Background job for large datasets
const jobId = await queue.add('ml-analysis', {
  datasetId,
  targetColumn,
  type: 'root-cause'
});
```

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **Input Validation**: All API inputs validated
3. **Rate Limiting**: Prevent abuse and DDoS
4. **HTTPS**: Use SSL in production
5. **JWT Security**: Short token expiration, refresh tokens
6. **Data Encryption**: Encrypt sensitive data at rest

## 📞 Support

### Documentation
- **API Docs**: http://localhost:5000/api-docs
- **Architecture**: See `ARCHITECTURE_UPGRADE.md`
- **Code Comments**: Comprehensive inline documentation

### Community
- **Issues**: GitHub Issues for bug reports
- **Discussions**: GitHub Discussions for questions
- **Contributing**: See CONTRIBUTING.md

---

## 🎯 Next Steps

1. **Deploy to Production**: Use Docker or cloud platform
2. **Monitor Performance**: Set up monitoring and alerting
3. **Scale Architecture**: Add load balancers and microservices
4. **Enhance ML Models**: Add more advanced algorithms
5. **User Management**: Implement multi-tenant support

**CausalAI v2.0** is now a production-ready SaaS analytics platform! 🚀
