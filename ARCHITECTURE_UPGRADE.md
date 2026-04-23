# CausalAI Production Architecture

## 🏗️ System Architecture Overview

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
                    │ - Insights      │
                    └─────────────────┘
```

## 📁 Upgraded Folder Structure

### Frontend (React)
```
frontend/
├── src/
│   ├── components/
│   │   ├── common/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   ├── charts/          # Chart components
│   │   └── insights/        # AI insights components
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Analytics/
│   │   ├── Upload/
│   │   └── Settings/
│   ├── services/
│   │   ├── api.js          # API client
│   │   ├── analytics.js     # Analytics service
│   │   └── insights.js      # Insights service
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── store/              # State management
│   └── styles/             # Global styles
├── public/
└── package.json
```

### Backend (Node.js)
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── dataset.controller.js
│   │   ├── analysis.controller.js
│   │   └── insights.controller.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── dataset.service.js
│   │   ├── analysis.service.js
│   │   ├── ml.service.js
│   │   └── insights.service.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Dataset.model.js
│   │   ├── Analysis.model.js
│   │   └── Insight.model.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── validation.middleware.js
│   │   ├── error.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── dataset.routes.js
│   │   ├── analysis.routes.js
│   │   └── insights.routes.js
│   ├── utils/
│   │   ├── dataPipeline.js
│   │   ├── validators.js
│   │   └── helpers.js
│   └── config/
│       ├── database.js
│       ├── ml.config.js
│       └── app.config.js
├── uploads/
├── logs/
└── package.json
```

### AI Service (Python)
```
ai-service/
├── src/
│   ├── models/
│   │   ├── correlation.py
│   │   ├── regression.py
│   │   ├── feature_importance.py
│   │   └── insights.py
│   ├── services/
│   │   ├── data_processor.py
│   │   ├── ml_engine.py
│   │   └── insights_generator.py
│   ├── utils/
│   │   ├── validators.py
│   │   └── helpers.py
│   └── api/
│       └── endpoints.py
├── tests/
├── requirements.txt
└── app.py
```

## 🔄 Data Flow Architecture

```
1. Dataset Upload → Validation → Storage → Metadata Extraction
2. Analysis Request → Data Pipeline → ML Processing → Results Storage
3. Insights Generation → ML Results → Business Rules → Dynamic Insights
4. Real-time Updates → WebSocket → Dashboard Refresh
```

## 🚀 Technology Stack

### Frontend
- **React 18** with hooks and context
- **Recharts** for interactive charts
- **Tailwind CSS** for modern styling
- **Axios** for API communication
- **React Query** for data fetching
- **Framer Motion** for animations

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Winston** for logging
- **Redis** for caching
- **Bull** for job queues

### AI Service
- **Python** with Flask/FastAPI
- **Scikit-learn** for ML models
- **Pandas** for data processing
- **NumPy** for numerical operations
- **SHAP** for explainability

## 📊 ML Pipeline Architecture

```
Raw Data → Validation → Cleaning → Preprocessing → Feature Engineering
    ↓
Model Training → Validation → Prediction → Insights Generation
    ↓
Results Storage → Caching → API Response → Dashboard Display
```

## 🔐 Security Architecture

- **JWT Authentication** with refresh tokens
- **Role-based Access Control** (admin, user, viewer)
- **Input Validation** and sanitization
- **Rate Limiting** and DDoS protection
- **CORS** configuration
- **Data Encryption** at rest and in transit

## 📈 Performance & Scalability

- **Horizontal Scaling** with load balancers
- **Database Indexing** and query optimization
- **API Response Caching** with Redis
- **CDN** for static assets
- **Lazy Loading** for dashboard components
- **Pagination** for large datasets
