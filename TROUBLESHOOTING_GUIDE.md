# 🔧 Troubleshooting Guide - Airwolf Platform Deployment

## 🚨 Common Deployment Issues & Solutions

### 1. Vercel Build Failures

#### Problem: "Build failed with exit code 1"
```bash
Error: Command "npm run build" exited with 1
```

**Solutions:**
1. **Check Node.js Version**
   ```json
   // package.json - ensure correct Node version
   "engines": {
     "node": ">=18.0.0"
   }
   ```

2. **Verify Build Command**
   ```json
   // package.json
   "scripts": {
     "build": "vite build",
     "preview": "vite preview"
   }
   ```

3. **Check Environment Variables**
   - Ensure all required env vars are set in Vercel dashboard
   - Verify variable names match exactly (case-sensitive)

#### Problem: "Module not found" errors
```bash
Error: Cannot resolve module '@/components/...' 
```

**Solutions:**
1. **Check tsconfig.json paths**
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

2. **Verify vite.config.ts**
   ```typescript
   import path from 'path'
   
   export default defineConfig({
     resolve: {
       alias: {
         '@': path.resolve(__dirname, './src')
       }
     }
   })
   ```

---

### 2. API Route Issues

#### Problem: "404 - API Route Not Found"
```bash
GET /api/agents - 404 Not Found
```

**Solutions:**
1. **Check vercel.json rewrites**
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "/api/$1"
       }
     ]
   }
   ```

2. **Verify API file structure**
   ```
   api/
   ├── agents.py
   ├── workflows.py
   ├── conversations.py
   └── __init__.py
   ```

3. **Check Python runtime**
   ```json
   // vercel.json
   {
     "functions": {
       "api/*.py": {
         "runtime": "python3.9"
       }
     }
   }
   ```

#### Problem: "Internal Server Error (500)"
```bash
POST /api/agents - 500 Internal Server Error
```

**Solutions:**
1. **Check MongoDB Connection**
   ```python
   # Verify MONGODB_URI is set correctly
   import os
   print(f"MongoDB URI: {os.getenv('MONGODB_URI')[:20]}...")
   ```

2. **Add Error Logging**
   ```python
   import logging
   logging.basicConfig(level=logging.DEBUG)
   
   try:
       # Your code here
   except Exception as e:
       logging.error(f"API Error: {str(e)}")
       raise
   ```

3. **Check Dependencies**
   ```txt
   # requirements.txt - ensure all deps are listed
   fastapi==0.104.1
   pymongo==4.6.0
   python-dotenv==1.0.0
   ```

---

### 3. Environment Variables

#### Problem: "Environment variable not found"
```bash
Error: MONGODB_URI is not defined
```

**Solutions:**
1. **Vercel Dashboard Setup**
   - Go to Project Settings → Environment Variables
   - Add all required variables:
     ```
     MONGODB_URI=mongodb+srv://...
     OPENAI_API_KEY=sk-...
     JWT_SECRET=your-secret-key
     NEXTAUTH_SECRET=your-nextauth-secret
     ```

2. **Local Development**
   ```bash
   # .env.local
   MONGODB_URI=mongodb://localhost:27017/airwolf
   OPENAI_API_KEY=sk-your-local-key
   JWT_SECRET=local-secret
   ```

3. **Environment Variable Validation**
   ```python
   import os
   
   required_vars = ['MONGODB_URI', 'OPENAI_API_KEY', 'JWT_SECRET']
   missing_vars = [var for var in required_vars if not os.getenv(var)]
   
   if missing_vars:
       raise ValueError(f"Missing environment variables: {missing_vars}")
   ```

---

### 4. Database Connection Issues

#### Problem: "MongoDB connection timeout"
```bash
ServerSelectionTimeoutError: No servers found
```

**Solutions:**
1. **Check MongoDB Atlas Settings**
   - Verify IP whitelist (add 0.0.0.0/0 for Vercel)
   - Check database user permissions
   - Ensure cluster is running

2. **Connection String Format**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   ```

3. **Connection Pool Settings**
   ```python
   from pymongo import MongoClient
   
   client = MongoClient(
       os.getenv('MONGODB_URI'),
       maxPoolSize=10,
       serverSelectionTimeoutMS=5000,
       connectTimeoutMS=10000
   )
   ```

#### Problem: "Authentication failed"
```bash
Authentication failed: Invalid credentials
```

**Solutions:**
1. **Verify Database User**
   - Check username/password in MongoDB Atlas
   - Ensure user has read/write permissions
   - Recreate user if necessary

2. **URL Encoding**
   ```python
   from urllib.parse import quote_plus
   
   username = quote_plus("user@domain.com")
   password = quote_plus("p@ssw0rd!")
   uri = f"mongodb+srv://{username}:{password}@cluster.mongodb.net/"
   ```

---

### 5. Frontend Build Issues

#### Problem: "TypeScript compilation errors"
```bash
Error: Type 'string | undefined' is not assignable to type 'string'
```

**Solutions:**
1. **Add Type Guards**
   ```typescript
   const apiUrl = process.env.NEXT_PUBLIC_API_URL;
   if (!apiUrl) {
     throw new Error('API URL not configured');
   }
   ```

2. **Update tsconfig.json**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noUncheckedIndexedAccess": true,
       "exactOptionalPropertyTypes": true
     }
   }
   ```

#### Problem: "CSS/Tailwind not loading"
```bash
Warning: Tailwind CSS classes not applied
```

**Solutions:**
1. **Check tailwind.config.js**
   ```javascript
   module.exports = {
     content: [
       "./src/**/*.{js,ts,jsx,tsx}",
       "./components/**/*.{js,ts,jsx,tsx}"
     ],
     theme: {
       extend: {}
     },
     plugins: []
   }
   ```

2. **Verify CSS imports**
   ```css
   /* globals.css */
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

---

### 6. Performance Issues

#### Problem: "Slow API responses"
```bash
API response time > 5 seconds
```

**Solutions:**
1. **Database Indexing**
   ```python
   # Add indexes for frequently queried fields
   collection.create_index("user_id")
   collection.create_index([("created_at", -1)])
   ```

2. **Connection Pooling**
   ```python
   # Use connection pooling
   client = MongoClient(
       uri,
       maxPoolSize=50,
       minPoolSize=10
   )
   ```

3. **Caching**
   ```python
   from functools import lru_cache
   
   @lru_cache(maxsize=100)
   def get_agent_config(agent_id):
       return collection.find_one({"_id": agent_id})
   ```

#### Problem: "High memory usage"
```bash
Function exceeded memory limit (1024 MB)
```

**Solutions:**
1. **Optimize Data Loading**
   ```python
   # Use projection to limit fields
   cursor = collection.find(
       {"user_id": user_id},
       {"name": 1, "status": 1, "_id": 1}
   )
   ```

2. **Streaming Responses**
   ```python
   from fastapi.responses import StreamingResponse
   
   def generate_data():
       for item in large_dataset:
           yield json.dumps(item) + "\n"
   
   return StreamingResponse(generate_data(), media_type="application/json")
   ```

---

### 7. Security Issues

#### Problem: "CORS errors"
```bash
Access to fetch blocked by CORS policy
```

**Solutions:**
1. **Configure CORS**
   ```python
   from fastapi.middleware.cors import CORSMiddleware
   
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-domain.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"]
   )
   ```

2. **Vercel Headers**
   ```json
   // vercel.json
   {
     "headers": [
       {
         "source": "/api/(.*)",
         "headers": [
           {
             "key": "Access-Control-Allow-Origin",
             "value": "*"
           }
         ]
       }
     ]
   }
   ```

#### Problem: "Authentication failures"
```bash
Unauthorized: Invalid token
```

**Solutions:**
1. **JWT Token Validation**
   ```python
   import jwt
   
   def verify_token(token: str):
       try:
           payload = jwt.decode(
               token, 
               os.getenv('JWT_SECRET'), 
               algorithms=["HS256"]
           )
           return payload
       except jwt.ExpiredSignatureError:
           raise HTTPException(401, "Token expired")
       except jwt.InvalidTokenError:
           raise HTTPException(401, "Invalid token")
   ```

2. **Token Refresh Logic**
   ```typescript
   // Frontend token refresh
   const refreshToken = async () => {
     try {
       const response = await fetch('/api/auth/refresh', {
         method: 'POST',
         credentials: 'include'
       });
       const data = await response.json();
       localStorage.setItem('token', data.token);
     } catch (error) {
       // Redirect to login
       window.location.href = '/login';
     }
   };
   ```

---

## 🔍 Debugging Tools & Commands

### Vercel CLI Debugging
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy with debug info
vercel --debug

# Check function logs
vercel logs [deployment-url]

# Local development
vercel dev
```

### Database Debugging
```python
# Test MongoDB connection
from pymongo import MongoClient
import os

try:
    client = MongoClient(os.getenv('MONGODB_URI'))
    db = client.get_default_database()
    print(f"Connected to: {db.name}")
    print(f"Collections: {db.list_collection_names()}")
except Exception as e:
    print(f"Connection failed: {e}")
```

### API Testing
```bash
# Test API endpoints
curl -X GET https://your-app.vercel.app/api/health
curl -X POST https://your-app.vercel.app/api/agents \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent"}'
```

### Frontend Debugging
```javascript
// Add debug logging
console.log('Environment:', process.env.NODE_ENV);
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Network debugging
fetch('/api/test')
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    return response.json();
  })
  .then(data => console.log('Response data:', data))
  .catch(error => console.error('Fetch error:', error));
```

---

## 📋 Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] Unit tests passing
- [ ] Build completes successfully
- [ ] No console errors in browser

### ✅ Environment Setup
- [ ] All environment variables configured
- [ ] MongoDB connection tested
- [ ] API keys validated
- [ ] CORS settings configured
- [ ] Authentication working

### ✅ Vercel Configuration
- [ ] vercel.json properly configured
- [ ] Build settings correct
- [ ] Function settings optimized
- [ ] Domain configured (if custom)
- [ ] Analytics enabled

### ✅ Database Setup
- [ ] MongoDB Atlas cluster running
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured
- [ ] Indexes created for performance
- [ ] Backup strategy in place

### ✅ Security
- [ ] Secrets not exposed in code
- [ ] HTTPS enforced
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation in place

---

## 🆘 Emergency Contacts & Resources

### Support Channels
- **Vercel Support:** https://vercel.com/support
- **MongoDB Atlas Support:** https://support.mongodb.com
- **GitHub Issues:** https://github.com/your-repo/issues

### Documentation Links
- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Docs:** https://docs.mongodb.com
- **FastAPI Docs:** https://fastapi.tiangolo.com

### Monitoring & Alerts
- **Vercel Analytics:** Monitor performance and errors
- **MongoDB Atlas Monitoring:** Database performance
- **Uptime Monitoring:** Set up external monitoring
- **Error Tracking:** Implement Sentry or similar

---

## 🔄 Recovery Procedures

### Rollback Deployment
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]

# Or redeploy specific commit
vercel --prod --force
```

### Database Recovery
```python
# Create database backup
mongodump --uri="mongodb+srv://..." --out=backup/

# Restore from backup
mongorestore --uri="mongodb+srv://..." backup/
```

### Environment Reset
```bash
# Clear Vercel cache
vercel --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

**🚨 Remember: Always test changes in a staging environment before deploying to production!**

**📞 For urgent issues, contact the development team immediately.**

---

**© 2024 Airwolf Platform - Internal Troubleshooting Guide**