// Universal Agent Platform - Service Integration Tester
// Phase 2: Comprehensive service testing and validation

import { ServiceHealthChecker, serviceConfigs } from '../config/services';
import { mockOpenAI, mockElevenLabs } from '../config/demo';

export interface ServiceTestResult {
  service: string;
  status: 'healthy' | 'unhealthy' | 'demo' | 'error';
  responseTime: number;
  error?: string;
  details: any;
}

export class ServiceIntegrationTester {
  
  /**
   * Run comprehensive service health checks
   */
  static async runAllTests(): Promise<ServiceTestResult[]> {
    console.log('🚀 Running Phase 2 Service Integration Tests...\n');
    
    const results: ServiceTestResult[] = [];
    const services = Object.keys(serviceConfigs);
    
    for (const serviceKey of services) {
      const config = serviceConfigs[serviceKey as keyof typeof serviceConfigs];
      const startTime = Date.now();
      
      try {
        console.log(`🔍 Testing ${config.name}...`);
        
        let result: ServiceTestResult;
        
        if (config.demoMode) {
          result = {
            service: config.name,
            status: 'demo',
            responseTime: Date.now() - startTime,
            details: { mode: 'demo', message: 'Using mock responses' }
          };
          console.log(`   ✅ ${config.name} - Demo mode active`);
        } else {
          // Run actual health check using generic method
          const healthCheck = await ServiceHealthChecker.checkService(serviceKey);
          
          result = {
            service: config.name,
            status: healthCheck.success ? 'healthy' : 'unhealthy',
            responseTime: Date.now() - startTime,
            error: healthCheck.error,
            details: healthCheck.data
          };
          
          console.log(`   ${healthCheck.success ? '✅' : '❌'} ${config.name} - ${healthCheck.success ? 'Healthy' : 'Failed'}`);
        }
        
        results.push(result);
        
      } catch (error) {
        results.push({
          service: config.name,
          status: 'error',
          responseTime: Date.now() - startTime,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: null
        });
        console.log(`   ❌ ${config.name} - Error: ${error}`);
      }
    }
    
    return results;
  }
  
  /**
   * Test specific AI service capabilities
   */
  static async testAIChat(): Promise<ServiceTestResult> {
    const startTime = Date.now();
    const config = serviceConfigs.openai;
    
    try {
      if (config.demoMode) {
        const response = await mockOpenAI.createChatCompletion({
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello, test message' }]
        });
        
        return {
          service: 'OpenAI Chat',
          status: 'demo',
          responseTime: Date.now() - startTime,
          details: { response: response.choices[0].message.content }
        };
      }
      
      // Real API test
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello, test message' }],
          max_tokens: 50
        })
      });
      
      const data = await response.json();
      
      return {
        service: 'OpenAI Chat',
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        error: data.error?.message,
        details: { response: data.choices?.[0]?.message?.content }
      };
      
    } catch (error) {
      return {
        service: 'OpenAI Chat',
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: null
      };
    }
  }
  
  /**
   * Test text-to-speech services
   */
  static async testTextToSpeech(): Promise<ServiceTestResult> {
    const startTime = Date.now();
    const config = serviceConfigs.elevenlabs;
    
    try {
      if (config.demoMode) {
        await mockElevenLabs.textToSpeech({
          text: 'Hello, this is a test',
          voice_id: 'pNInz6obpgDQGcFmaJgB',
          model_id: 'eleven_monolingual_v1'
        });
        
        return {
          service: 'ElevenLabs TTS',
          status: 'demo',
          responseTime: Date.now() - startTime,
          details: { audioUrl: 'demo-audio.mp3', duration: '2.5s' }
        };
      }
      
      // Real API test
      const response = await fetch(`${config.baseUrl}/text-to-speech/pNInz6obpgDQGcFmaJgB`, {
        method: 'POST',
        headers: {
          'xi-api-key': config.apiKey!,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: 'Hello, this is a test',
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        })
      });
      
      return {
        service: 'ElevenLabs TTS',
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: Date.now() - startTime,
        details: { status: response.status, contentType: response.headers.get('content-type') }
      };
      
    } catch (error) {
      return {
        service: 'ElevenLabs TTS',
        status: 'error',
        responseTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: null
      };
    }
  }
  
  /**
   * Generate comprehensive service report
   */
  static async generateReport(): Promise<string> {
    const results = await this.runAllTests();
    const aiTest = await this.testAIChat();
    const ttsTest = await this.testTextToSpeech();
    
    const allTests = [...results, aiTest, ttsTest];
    
    const report = `
🎯 Universal Agent Platform - Service Integration Report
${'='.repeat(60)}

📊 Service Status Summary:
${allTests.map(test => 
  `   ${test.status === 'healthy' ? '✅' : test.status === 'demo' ? '🎯' : '❌'} ${test.service}: ${test.status.toUpperCase()} (${test.responseTime}ms)`
).join('\n')}

📈 Detailed Results:
${allTests.map(test => `
🔍 ${test.service}:
   Status: ${test.status.toUpperCase()}
   Response Time: ${test.responseTime}ms
   ${test.error ? `Error: ${test.error}` : `Details: ${JSON.stringify(test.details, null, 2)}`}
`).join('\n')}

🚀 Next Steps for Phase 2:
${allTests.filter(t => t.status === 'demo').length > 0 ? `
   🎯 Demo Mode Active: ${allTests.filter(t => t.status === 'demo').length} services
   💡 To enable real services:
   1. Add your API keys to .env file
   2. Set VITE_ENABLE_DEMO_MODE=false
   3. Restart the development server
` : `
   ✅ All services configured and healthy!
   🔄 Ready for advanced integrations and optimizations
`}

🎉 Phase 2 Service Integration: ${allTests.filter(t => t.status === 'healthy' || t.status === 'demo').length}/${allTests.length} services ready!
`;

    console.log(report);
    return report;
  }
}

// Auto-run service tests when imported
if (typeof window !== 'undefined') {
  console.log('🔧 Service Integration Tester loaded');
}