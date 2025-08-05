#!/usr/bin/env python3
"""
Comprehensive Backend Testing for AImpact Platform - Universal Agent Platform
Tests all API endpoints and core services
"""

import asyncio
import aiohttp
import json
import base64
import os
import sys
from typing import Dict, Any, List
from datetime import datetime
import tempfile
import wave

# Get backend URL from frontend environment
def get_backend_url():
    """Get backend URL from frontend .env file"""
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
print(f"Testing backend at: {BACKEND_URL}")

class AImpactPlatformTester:
    """Comprehensive tester for AImpact Platform backend"""
    
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = None
        self.test_results = []
        self.created_agents = []
        self.created_rooms = []
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    def log_test(self, test_name: str, success: bool, details: str = "", response_data: Any = None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"    {details}")
        if not success and response_data:
            print(f"    Response: {response_data}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
    
    async def test_root_endpoints(self):
        """Test root and health endpoints"""
        print("\n🔍 Testing Root Endpoints...")
        
        # Test root endpoint
        try:
            async with self.session.get(f"{self.base_url}/") as response:
                if response.status == 200:
                    data = await response.json()
                    expected_features = [
                        "Universal Agent Templates",
                        "Real-time Voice Communication", 
                        "Visual Agent Builder",
                        "Enterprise-grade Monitoring",
                        "Multi-modal AI Agents",
                        "6-Layer Architecture"
                    ]
                    
                    has_features = all(feature in data.get("features", []) for feature in expected_features)
                    self.log_test(
                        "Root Endpoint (/)", 
                        has_features and data.get("message") and "Universal Agent Platform" in data.get("message", ""),
                        f"Platform info retrieved with {len(data.get('features', []))} features"
                    )
                else:
                    self.log_test("Root Endpoint (/)", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Root Endpoint (/)", False, f"Exception: {str(e)}")
        
        # Test health endpoint
        try:
            async with self.session.get(f"{self.base_url}/health") as response:
                if response.status == 200:
                    data = await response.json()
                    services = data.get("services", {})
                    healthy_services = sum(1 for status in services.values() if status in ["healthy", "active"])
                    self.log_test(
                        "Health Check (/health)", 
                        data.get("status") == "healthy",
                        f"System healthy with {healthy_services}/{len(services)} services active"
                    )
                else:
                    self.log_test("Health Check (/health)", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Health Check (/health)", False, f"Exception: {str(e)}")
    
    async def test_agents_api(self):
        """Test Agents API endpoints"""
        print("\n🤖 Testing Agents API...")
        
        # Test get agent templates
        try:
            async with self.session.get(f"{self.base_url}/api/agents/templates") as response:
                if response.status == 200:
                    data = await response.json()
                    templates = data.get("templates", {})
                    expected_templates = ["customer_service", "sales_assistant", "interview_assistant", "technical_expert"]
                    has_templates = all(template in templates for template in expected_templates)
                    self.log_test(
                        "Get Agent Templates", 
                        has_templates,
                        f"Retrieved {len(templates)} templates: {list(templates.keys())}"
                    )
                else:
                    self.log_test("Get Agent Templates", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Agent Templates", False, f"Exception: {str(e)}")
        
        # Test create agent
        agent_data = {
            "agent_type": "customer_service",
            "name": "Customer Support Agent Alpha",
            "custom_config": {
                "description": "Advanced customer support agent for enterprise clients",
                "personality": "professional, empathetic, solution-focused"
            }
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/agents", 
                json=agent_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("agent_id"):
                        agent_id = data["agent_id"]
                        self.created_agents.append(agent_id)
                        self.log_test(
                            "Create Agent", 
                            True,
                            f"Created agent: {agent_id} ({data.get('agent', {}).get('name', 'Unknown')})"
                        )
                        
                        # Test get specific agent
                        await self.test_get_agent(agent_id)
                        
                        # Test chat with agent
                        await self.test_agent_chat(agent_id)
                        
                    else:
                        self.log_test("Create Agent", False, "No agent_id in response", data)
                else:
                    self.log_test("Create Agent", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Create Agent", False, f"Exception: {str(e)}")
        
        # Test list agents
        try:
            async with self.session.get(f"{self.base_url}/api/agents") as response:
                if response.status == 200:
                    agents = await response.json()
                    self.log_test(
                        "List Agents", 
                        isinstance(agents, list),
                        f"Retrieved {len(agents)} active agents"
                    )
                else:
                    self.log_test("List Agents", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("List Agents", False, f"Exception: {str(e)}")
    
    async def test_get_agent(self, agent_id: str):
        """Test getting specific agent details"""
        try:
            async with self.session.get(f"{self.base_url}/api/agents/{agent_id}") as response:
                if response.status == 200:
                    data = await response.json()
                    agent = data.get("agent", {})
                    self.log_test(
                        "Get Agent Details", 
                        agent.get("agent_id") == agent_id,
                        f"Retrieved agent: {agent.get('name')} (Status: {agent.get('status')})"
                    )
                else:
                    self.log_test("Get Agent Details", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Agent Details", False, f"Exception: {str(e)}")
    
    async def test_agent_chat(self, agent_id: str):
        """Test chatting with an agent"""
        chat_data = {
            "message": "Hello! I'm interested in learning about your AI voice agent platform. Can you tell me about the key features and how it compares to competitors like Parloa?",
            "user_id": "test_user_enterprise_demo"
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/agents/{agent_id}/chat",
                json=chat_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("response"):
                        response_text = data["response"].get("text_response", "")
                        has_audio = bool(data["response"].get("audio_response"))
                        self.log_test(
                            "Agent Chat", 
                            len(response_text) > 0,
                            f"Got response ({len(response_text)} chars, Audio: {has_audio}): {response_text[:100]}..."
                        )
                    else:
                        self.log_test("Agent Chat", False, "No response in data", data)
                else:
                    self.log_test("Agent Chat", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Agent Chat", False, f"Exception: {str(e)}")
    
    async def test_voice_api(self):
        """Test Voice API endpoints"""
        print("\n🎤 Testing Voice API...")
        
        # Test get available voices
        try:
            async with self.session.get(f"{self.base_url}/api/voice/voices") as response:
                if response.status == 200:
                    data = await response.json()
                    voices = data.get("voices", [])
                    profiles = data.get("voice_profiles", {})
                    self.log_test(
                        "Get Available Voices", 
                        data.get("success", False),
                        f"Retrieved {len(voices)} voices and {len(profiles)} profiles"
                    )
                else:
                    self.log_test("Get Available Voices", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Available Voices", False, f"Exception: {str(e)}")
        
        # Test get voice profiles
        try:
            async with self.session.get(f"{self.base_url}/api/voice/profiles") as response:
                if response.status == 200:
                    data = await response.json()
                    profiles = data.get("profiles", {})
                    expected_profiles = ["professional_female", "professional_male", "customer_service"]
                    has_profiles = any(profile in profiles for profile in expected_profiles)
                    self.log_test(
                        "Get Voice Profiles", 
                        has_profiles,
                        f"Retrieved profiles: {list(profiles.keys())}"
                    )
                else:
                    self.log_test("Get Voice Profiles", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Voice Profiles", False, f"Exception: {str(e)}")
        
        # Test text-to-speech
        tts_data = {
            "text": "Welcome to AImpact Platform, the Universal Agent Platform that democratizes AI voice agent development. Our enterprise-grade solution outperforms industry leaders with advanced 6-layer architecture.",
            "voice_profile": "professional_female"
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/voice/tts",
                json=tts_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("audio_base64"):
                        audio_data = data["audio_base64"]
                        self.log_test(
                            "Text-to-Speech", 
                            len(audio_data) > 0,
                            f"Generated audio ({len(audio_data)} chars base64) for {len(tts_data['text'])} chars text"
                        )
                    else:
                        self.log_test("Text-to-Speech", False, "No audio data in response", data)
                else:
                    self.log_test("Text-to-Speech", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Text-to-Speech", False, f"Exception: {str(e)}")
    
    async def test_rooms_api(self):
        """Test Rooms API endpoints"""
        print("\n🏠 Testing Rooms API...")
        
        # Test create room
        room_data = {
            "name": f"enterprise_demo_room_{int(datetime.now().timestamp())}",
            "room_type": "voice_agent",
            "max_participants": 5
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/rooms",
                json=room_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("room"):
                        room_name = data["room"]["name"]
                        self.created_rooms.append(room_name)
                        self.log_test(
                            "Create Room", 
                            True,
                            f"Created room: {room_name} (Max participants: {data['room'].get('max_participants')})"
                        )
                        
                        # Test generate token for the room
                        await self.test_generate_token(room_name)
                        
                        # Test get room details
                        await self.test_get_room_details(room_name)
                        
                    else:
                        self.log_test("Create Room", False, "No room data in response", data)
                else:
                    self.log_test("Create Room", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Create Room", False, f"Exception: {str(e)}")
        
        # Test list rooms
        try:
            async with self.session.get(f"{self.base_url}/api/rooms") as response:
                if response.status == 200:
                    data = await response.json()
                    rooms = data.get("rooms", [])
                    self.log_test(
                        "List Rooms", 
                        data.get("success", False),
                        f"Retrieved {len(rooms)} active rooms"
                    )
                else:
                    self.log_test("List Rooms", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("List Rooms", False, f"Exception: {str(e)}")
        
        # Test get room configs
        try:
            async with self.session.get(f"{self.base_url}/api/rooms/configs/available") as response:
                if response.status == 200:
                    data = await response.json()
                    configs = data.get("configs", {})
                    expected_configs = ["voice_agent", "interview", "group_call"]
                    has_configs = all(config in configs for config in expected_configs)
                    self.log_test(
                        "Get Room Configs", 
                        has_configs,
                        f"Retrieved configs: {list(configs.keys())}"
                    )
                else:
                    self.log_test("Get Room Configs", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Room Configs", False, f"Exception: {str(e)}")
    
    async def test_generate_token(self, room_name: str):
        """Test generating access token for room"""
        token_data = {
            "room_name": room_name,
            "participant_name": "enterprise_demo_user",
            "permissions": {
                "can_publish": True,
                "can_subscribe": True
            }
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/rooms/token",
                json=token_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("token"):
                        token = data["token"]
                        livekit_url = data.get("livekit_url", "")
                        self.log_test(
                            "Generate Room Token", 
                            len(token) > 0,
                            f"Generated token for {token_data['participant_name']} (LiveKit: {livekit_url[:50]}...)"
                        )
                    else:
                        self.log_test("Generate Room Token", False, "No token in response", data)
                else:
                    self.log_test("Generate Room Token", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Generate Room Token", False, f"Exception: {str(e)}")
    
    async def test_get_room_details(self, room_name: str):
        """Test getting room details and participants"""
        try:
            async with self.session.get(f"{self.base_url}/api/rooms/{room_name}") as response:
                if response.status == 200:
                    data = await response.json()
                    participants = data.get("participants", [])
                    self.log_test(
                        "Get Room Details", 
                        data.get("success", False),
                        f"Room {room_name} has {len(participants)} participants"
                    )
                else:
                    self.log_test("Get Room Details", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Room Details", False, f"Exception: {str(e)}")
    
    async def test_studio_api(self):
        """Test Studio API endpoints"""
        print("\n🎨 Testing Studio API...")
        
        # Test get advanced templates
        try:
            async with self.session.get(f"{self.base_url}/api/studio/templates/advanced") as response:
                if response.status == 200:
                    data = await response.json()
                    templates = data.get("templates", {})
                    # Check if templates have advanced config
                    has_advanced_config = any(
                        "advanced_config" in template 
                        for template in templates.values()
                    )
                    self.log_test(
                        "Get Advanced Templates", 
                        has_advanced_config,
                        f"Retrieved {len(templates)} advanced templates with enhanced configurations"
                    )
                else:
                    self.log_test("Get Advanced Templates", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Advanced Templates", False, f"Exception: {str(e)}")
        
        # Test create studio agent
        studio_agent_data = {
            "name": "Enterprise Sales Specialist",
            "agent_type": "sales_assistant",
            "description": "Advanced sales agent specialized in enterprise B2B solutions",
            "voice_profile": "professional_female",
            "llm_model": "gpt-4o",
            "personality_traits": ["confident", "knowledgeable", "consultative", "results-driven"],
            "capabilities": ["lead_qualification", "product_demos", "pricing_discussions", "objection_handling"],
            "custom_prompts": {
                "greeting": "Hello! I'm your AI sales specialist. I'm here to help you discover how AImpact Platform can transform your business operations.",
                "qualification": "Let me understand your current challenges and requirements to provide the best solution."
            },
            "response_style": "consultative and value-focused"
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/studio/agents/create",
                json=studio_agent_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    if data.get("success") and data.get("agent_id"):
                        agent_id = data["agent_id"]
                        self.created_agents.append(agent_id)
                        agent_info = data.get("agent", {})
                        self.log_test(
                            "Create Studio Agent", 
                            True,
                            f"Created studio agent: {agent_id} ({agent_info.get('name')})"
                        )
                        
                        # Test agent configuration retrieval
                        await self.test_get_agent_config(agent_id)
                        
                        # Test agent conversation testing
                        await self.test_agent_conversation_test(agent_id)
                        
                    else:
                        self.log_test("Create Studio Agent", False, "No agent_id in response", data)
                else:
                    self.log_test("Create Studio Agent", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Create Studio Agent", False, f"Exception: {str(e)}")
        
        # Test system status
        try:
            async with self.session.get(f"{self.base_url}/api/studio/system/status") as response:
                if response.status == 200:
                    data = await response.json()
                    system_status = data.get("system_status", {})
                    active_agents = system_status.get("active_agents", 0)
                    active_rooms = system_status.get("active_rooms", 0)
                    services = [k for k, v in system_status.items() if k.endswith("_service") and v == "active"]
                    self.log_test(
                        "Get System Status", 
                        data.get("success", False),
                        f"System: {len(services)} services active, {active_agents} agents, {active_rooms} rooms"
                    )
                else:
                    self.log_test("Get System Status", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get System Status", False, f"Exception: {str(e)}")
    
    async def test_get_agent_config(self, agent_id: str):
        """Test getting agent configuration for editing"""
        try:
            async with self.session.get(f"{self.base_url}/api/studio/agents/{agent_id}/config") as response:
                if response.status == 200:
                    data = await response.json()
                    agent = data.get("agent", {})
                    editable_fields = data.get("editable_fields", [])
                    self.log_test(
                        "Get Agent Config", 
                        len(editable_fields) > 0,
                        f"Retrieved config for {agent.get('name')} with {len(editable_fields)} editable fields"
                    )
                else:
                    self.log_test("Get Agent Config", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Agent Config", False, f"Exception: {str(e)}")
    
    async def test_agent_conversation_test(self, agent_id: str):
        """Test agent with conversation sequence"""
        test_data = {
            "agent_id": agent_id,
            "test_messages": [
                "Hi, I'm interested in your AI voice agent platform.",
                "How does your platform compare to competitors like Parloa and Artisan.co?",
                "What are the key enterprise features that set you apart?",
                "Can you tell me about pricing and implementation timeline?"
            ]
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/studio/agents/{agent_id}/test",
                json=test_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    test_results = data.get("test_results", [])
                    successful_responses = sum(1 for result in test_results if result.get("agent_response"))
                    self.log_test(
                        "Agent Conversation Test", 
                        successful_responses == len(test_data["test_messages"]),
                        f"Completed {successful_responses}/{len(test_data['test_messages'])} conversation turns"
                    )
                else:
                    self.log_test("Agent Conversation Test", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Agent Conversation Test", False, f"Exception: {str(e)}")
    
    async def test_agent_deployment(self):
        """Test agent deployment to rooms"""
        if not self.created_agents or not self.created_rooms:
            self.log_test("Agent Deployment", False, "No agents or rooms available for deployment test")
            return
        
        print("\n🚀 Testing Agent Deployment...")
        
        agent_id = self.created_agents[0]
        room_name = self.created_rooms[0]
        
        deploy_data = {
            "room_name": room_name
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/api/agents/{agent_id}/deploy",
                json=deploy_data
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.log_test(
                        "Deploy Agent to Room", 
                        data.get("success", False),
                        f"Deployed agent {agent_id} to room {room_name}"
                    )
                    
                    # Test getting agents in room
                    await self.test_get_agents_in_room(room_name)
                    
                else:
                    self.log_test("Deploy Agent to Room", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Deploy Agent to Room", False, f"Exception: {str(e)}")
    
    async def test_get_agents_in_room(self, room_name: str):
        """Test getting agents deployed to a room"""
        try:
            async with self.session.get(f"{self.base_url}/api/agents/room/{room_name}") as response:
                if response.status == 200:
                    data = await response.json()
                    agents = data.get("agents", [])
                    self.log_test(
                        "Get Agents in Room", 
                        True,
                        f"Room {room_name} has {len(agents)} deployed agents"
                    )
                else:
                    self.log_test("Get Agents in Room", False, f"HTTP {response.status}", await response.text())
        except Exception as e:
            self.log_test("Get Agents in Room", False, f"Exception: {str(e)}")
    
    async def cleanup_test_resources(self):
        """Clean up created test resources"""
        print("\n🧹 Cleaning up test resources...")
        
        # Remove created agents
        for agent_id in self.created_agents:
            try:
                async with self.session.delete(f"{self.base_url}/api/agents/{agent_id}") as response:
                    if response.status == 200:
                        print(f"    ✅ Removed agent: {agent_id}")
                    else:
                        print(f"    ⚠️  Failed to remove agent: {agent_id}")
            except Exception as e:
                print(f"    ❌ Error removing agent {agent_id}: {e}")
        
        # Remove created rooms
        for room_name in self.created_rooms:
            try:
                async with self.session.delete(f"{self.base_url}/api/rooms/{room_name}") as response:
                    if response.status == 200:
                        print(f"    ✅ Removed room: {room_name}")
                    else:
                        print(f"    ⚠️  Failed to remove room: {room_name}")
            except Exception as e:
                print(f"    ❌ Error removing room {room_name}: {e}")
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"\n" + "="*80)
        print(f"🎯 AImpact Platform Backend Test Summary")
        print(f"="*80)
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ Failed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   • {result['test']}: {result['details']}")
        
        print(f"\n🏆 Platform Status: {'OPERATIONAL' if passed_tests/total_tests > 0.8 else 'NEEDS ATTENTION'}")
        print(f"="*80)

async def main():
    """Run comprehensive backend tests"""
    print("🚀 Starting AImpact Platform Backend Testing...")
    print(f"Backend URL: {BACKEND_URL}")
    
    async with AImpactPlatformTester() as tester:
        # Run all test suites
        await tester.test_root_endpoints()
        await tester.test_agents_api()
        await tester.test_voice_api()
        await tester.test_rooms_api()
        await tester.test_studio_api()
        await tester.test_agent_deployment()
        
        # Clean up resources
        await tester.cleanup_test_resources()
        
        # Print summary
        tester.print_summary()
        
        # Return success status
        total_tests = len(tester.test_results)
        passed_tests = sum(1 for result in tester.test_results if result["success"])
        return passed_tests / total_tests > 0.8

if __name__ == "__main__":
    try:
        success = asyncio.run(main())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️  Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Testing failed with error: {e}")
        sys.exit(1)