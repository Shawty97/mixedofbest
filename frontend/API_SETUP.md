# Universal Agent Platform - API Key Setup Guide
## Phase 2: Service Integration & Configuration

This guide walks you through setting up real API keys for production use of the Universal Agent Platform.

## 🎯 Quick Setup

### 1. Required API Services

| Service | Purpose | Required | Free Tier | Setup Time |
|---------|---------|----------|-----------|------------|
| **OpenAI** | AI Chat & Agent Intelligence | ✅ | ✅ 5$/mo | 5 min |
| **ElevenLabs** | Text-to-Speech | ❌ | ✅ 10k chars | 3 min |
| **Azure Speech** | Speech Recognition | ❌ | ✅ 5h audio | 10 min |
| **Qdrant** | Vector Database | ❌ | ✅ 1GB | 5 min |

### 2. Get Your API Keys

#### 🔗 OpenAI (Required)
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create an account or sign in
3. Go to "API Keys" → "Create new secret key"
4. Copy your key (starts with `sk-`)
5. Add payment method for billing

#### 🔗 ElevenLabs (Optional - TTS)
1. Visit [ElevenLabs](https://elevenlabs.io/)
2. Create account → Go to "Profile" → "API Keys"
3. Generate new API key
4. Copy your key (starts with `eleven_`)

#### 🔗 Azure Speech Services (Optional - STT)
1. Visit [Azure Portal](https://portal.azure.com)
2. Create "Speech Services" resource
3. Get "Key 1" and "Region" from resource overview

#### 🔗 Qdrant Cloud (Optional - Vector DB)
1. Visit [Qdrant Cloud](https://cloud.qdrant.io)
2. Create cluster → Get API key and URL
3. Or use local: `docker run -p 6333:6333 qdrant/qdrant`

### 3. Update Environment Variables

Replace the demo values in your `.env` file:

```bash
# Replace these with your actual API keys
VITE_OPENAI_API_KEY=sk-your-actual-openai-key-here
VITE_ELEVENLABS_API_KEY=your-actual-elevenlabs-key-here
VITE_AZURE_SPEECH_KEY=your-actual-azure-speech-key-here
VITE_AZURE_SPEECH_REGION=your-azure-region-here
VITE_QDRANT_URL=https://your-cluster-url.qdrant.io
VITE_QDRANT_API_KEY=your-actual-qdrant-key-here

# Set to false for production
VITE_ENABLE_DEMO_MODE=false
```

### 4. Backend Environment

Update `backend/.env`:

```bash
# AI Services
OPENAI_API_KEY=sk-your-actual-openai-key-here
ELEVENLABS_API_KEY=your-actual-elevenlabs-key-here
AZURE_SPEECH_KEY=your-actual-azure-speech-key-here
AZURE_SPEECH_REGION=your-azure-region-here

# Vector Database
QDRANT_URL=https://your-cluster-url.qdrant.io
QDRANT_API_KEY=your-actual-qdrant-key-here
```

### 5. Test Your Setup

Run the service integration test:

```bash
# Check service status
node test-setup.js

# Run comprehensive service tests
npm run test:services

# Or use the service tester
node -e "import('./src/utils/serviceTester.js').then(t => t.ServiceIntegrationTester.generateReport())"
```

## 🎛️ Service Configuration Examples

### OpenAI Configuration
```typescript
// Example agent using OpenAI
const agentConfig = {
  ai: {
    provider: 'openai',
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 2000
  }
};
```

### ElevenLabs Voice Configuration
```typescript
// Example voice settings
const voiceConfig = {
  provider: 'elevenlabs',
  voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam
  settings: {
    stability: 0.5,
    similarity_boost: 0.75
  }
};
```

### Azure Speech Recognition
```typescript
// Example speech config
const speechConfig = {
  provider: 'azure',
  language: 'en-US',
  region: 'eastus',
  key: process.env.VITE_AZURE_SPEECH_KEY
};
```

## 🔍 Troubleshooting

### Common Issues

#### "Invalid API Key" Errors
- Double-check key format (no extra spaces)
- Ensure billing is enabled on OpenAI
- Verify key hasn't expired

#### "Rate Limit Exceeded"
- Check usage dashboard for each service
- Implement exponential backoff
- Consider upgrading plan

#### "Service Unavailable"
- Check service status pages
- Verify network connectivity
- Test with curl commands

### Debug Commands

```bash
# Test OpenAI
curl -H "Authorization: Bearer sk-your-key" \
     https://api.openai.com/v1/models

# Test ElevenLabs
curl -H "xi-api-key: your-key" \
     https://api.elevenlabs.io/v1/user/subscription

# Test Azure Speech
curl -H "Ocp-Apim-Subscription-Key: your-key" \
     https://your-region.api.cognitive.microsoft.com/sts/v1.0/issueToken
```

## 📊 Service Limits & Best Practices

### Rate Limits
- **OpenAI**: 60 requests/minute (GPT-4), 3,500 RPM (GPT-3.5)
- **ElevenLabs**: 30 requests/minute (free), 500 RPM (paid)
- **Azure**: 20 requests/second (standard tier)

### Cost Optimization
- Use GPT-3.5-turbo for simple tasks
- Implement caching for repeated queries
- Monitor usage with cost alerts
- Use demo mode for development

### Security
- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Monitor API usage for anomalies

## 🚀 Next Steps

After completing Phase 2:

1. **Phase 3**: Feature Testing & Validation
   - Test agent creation
   - Validate marketplace integration
   - Check authentication flow

2. **Phase 4**: Advanced Features
   - Multi-cloud deployment
   - Quantum computing integration
   - Performance optimization

3. **Production Deployment**
   - Set up monitoring
   - Configure load balancing
   - Implement backup strategies

## 📞 Support

If you encounter issues:
1. Check the [troubleshooting section](#troubleshooting)
2. Run diagnostic commands above
3. Check service status pages
4. Open an issue with detailed logs

---

**Status**: Phase 2 Ready ✅
**Estimated Setup Time**: 15-30 minutes
**Next**: Phase 3 - Feature Testing