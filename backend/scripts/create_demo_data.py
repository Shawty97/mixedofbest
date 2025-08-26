#!/usr/bin/env python3
"""
Demo Data Creation Script
Creates sample agents, workflows, tasks, and sessions for demonstration purposes.
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta
from typing import List, Dict, Any

# Add the backend directory to the Python path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, backend_dir)

from repositories.models import AgentModel, WorkflowModel, TaskModel, SessionModel
from repositories.mongodb_repository import MongoDBRepository

async def create_demo_agents(repo: MongoDBRepository) -> List[str]:
    """Create demo agents"""
    print("Creating demo agents...")
    
    demo_agents = [
        {
            "agent_id": "sales_assistant_001",
            "agent_type": "sales_assistant",
            "name": "Sales Assistant Sarah",
            "description": "Expert sales agent for customer acquisition and lead qualification",
            "type": "sales",
            "capabilities": ["lead_qualification", "product_demo", "objection_handling", "closing_techniques"],
            "personality": {
                "tone": "professional",
                "style": "consultative",
                "energy_level": "high"
            },
            "configuration": {
                "voice_enabled": True,
                "language": "en",
                "response_time": "fast"
            }
        },
        {
            "agent_id": "support_agent_001",
            "agent_type": "customer_service",
            "name": "Support Specialist Sam",
            "description": "Customer support agent for technical assistance and problem resolution",
            "type": "support",
            "capabilities": ["technical_support", "troubleshooting", "escalation_management", "documentation"],
            "personality": {
                "tone": "helpful",
                "style": "patient",
                "energy_level": "calm"
            },
            "configuration": {
                "voice_enabled": True,
                "language": "en",
                "response_time": "thorough"
            }
        },
        {
            "agent_id": "hr_bot_001",
            "agent_type": "interview_assistant",
            "name": "Onboarding Guide Oliver",
            "description": "Specialized agent for new user onboarding and training",
            "type": "onboarding",
            "capabilities": ["user_training", "process_guidance", "progress_tracking", "resource_sharing"],
            "personality": {
                "tone": "friendly",
                "style": "educational",
                "energy_level": "encouraging"
            },
            "configuration": {
                "voice_enabled": True,
                "language": "en",
                "response_time": "detailed"
            }
        }
    ]
    
    agent_ids = []
    for agent_data in demo_agents:
        result = await repo.create_agent(agent_data)
        if result and result.inserted_id:
            agent_ids.append(str(result.inserted_id))
            print(f"Created agent: {agent_data['name']}")
        else:
            print(f"Failed to create agent: {agent_data['name']}")
    
    return agent_ids

async def create_demo_workflows(repo: MongoDBRepository, agent_ids: List[str]) -> List[str]:
    """Create demo workflows"""
    print("Creating demo workflows...")
    
    demo_workflows = [
        {
            "name": "Customer Onboarding Flow",
            "description": "Complete workflow for new customer onboarding",
            "type": "onboarding",
            "steps": [
                {"step": 1, "action": "welcome_message", "description": "Send welcome message"},
                {"step": 2, "action": "collect_info", "description": "Collect customer information"},
                {"step": 3, "action": "setup_account", "description": "Set up customer account"},
                {"step": 4, "action": "training_session", "description": "Conduct product training"}
            ],
            "estimated_duration": 45,
            "success_criteria": ["Account created", "Training completed", "First interaction logged"]
        },
        {
            "name": "Sales Qualification Process",
            "description": "Lead qualification and sales process workflow",
            "type": "sales",
            "steps": [
                {"step": 1, "action": "initial_contact", "description": "Make initial contact"},
                {"step": 2, "action": "needs_assessment", "description": "Assess customer needs"},
                {"step": 3, "action": "product_demo", "description": "Demonstrate product features"},
                {"step": 4, "action": "proposal_creation", "description": "Create customized proposal"}
            ],
            "estimated_duration": 60,
            "success_criteria": ["Lead qualified", "Demo completed", "Proposal sent"]
        },
        {
            "name": "Technical Support Resolution",
            "description": "Standard technical support issue resolution workflow",
            "type": "support",
            "steps": [
                {"step": 1, "action": "issue_identification", "description": "Identify the issue"},
                {"step": 2, "action": "troubleshooting", "description": "Perform troubleshooting steps"},
                {"step": 3, "action": "solution_implementation", "description": "Implement solution"},
                {"step": 4, "action": "follow_up", "description": "Follow up with customer"}
            ],
            "estimated_duration": 30,
            "success_criteria": ["Issue resolved", "Customer satisfied", "Documentation updated"]
        }
    ]
    
    workflow_ids = []
    for workflow_data in demo_workflows:
        result = await repo.create_workflow(workflow_data)
        if result and result.inserted_id:
            workflow_ids.append(str(result.inserted_id))
            print(f"Created workflow: {workflow_data['name']}")
        else:
            print(f"Failed to create workflow: {workflow_data['name']}")
    
    return workflow_ids

async def create_demo_tasks(repo: MongoDBRepository, workflow_ids: List[str]) -> List[str]:
    """Create demo tasks"""
    print("Creating demo tasks...")
    
    demo_tasks = [
        {
            "title": "Welcome New Customer",
            "description": "Send personalized welcome message to new customer",
            "type": "communication",
            "status": "pending",
            "priority": "high",
            "workflow_id": workflow_ids[0] if workflow_ids else None,
            "estimated_duration": 5,
            "required_skills": ["communication", "customer_service"],
            "context": {
                "customer_type": "new",
                "communication_channel": "email",
                "template_required": True
            }
        },
        {
            "title": "Conduct Technical Assessment",
            "description": "Evaluate candidate's technical skills through structured interview",
            "type": "assessment",
            "status": "in_progress",
            "priority": "medium",
            "workflow_id": workflow_ids[1] if len(workflow_ids) > 1 else None,
            "estimated_duration": 45,
            "required_skills": ["technical_evaluation", "interviewing", "programming"],
            "context": {
                "position": "Senior Software Engineer",
                "technologies": ["Python", "React", "PostgreSQL"],
                "experience_level": "senior"
            }
        },
        {
            "title": "Product Demo Presentation",
            "description": "Demonstrate key product features to qualified prospect",
            "type": "presentation",
            "status": "completed",
            "priority": "high",
            "workflow_id": workflow_ids[2] if len(workflow_ids) > 2 else None,
            "estimated_duration": 30,
            "required_skills": ["product_knowledge", "presentation", "sales"],
            "context": {
                "prospect_industry": "fintech",
                "company_size": "mid-market",
                "decision_makers": ["CTO", "VP Engineering"]
            }
        },
        {
            "title": "Follow-up Call Scheduling",
            "description": "Schedule follow-up call with interested prospect",
            "type": "scheduling",
            "status": "pending",
            "priority": "medium",
            "workflow_id": workflow_ids[2] if len(workflow_ids) > 2 else None,
            "estimated_duration": 10,
            "required_skills": ["scheduling", "communication"],
            "context": {
                "preferred_time_zone": "EST",
                "meeting_type": "technical_deep_dive",
                "attendees_count": 3
            }
        },
        {
            "title": "Customer Onboarding Documentation",
            "description": "Create comprehensive onboarding documentation for new customer",
            "type": "documentation",
            "status": "in_progress",
            "priority": "low",
            "workflow_id": workflow_ids[0] if workflow_ids else None,
            "estimated_duration": 60,
            "required_skills": ["documentation", "technical_writing"],
            "context": {
                "customer_tier": "enterprise",
                "integration_complexity": "high",
                "custom_requirements": True
            }
        }
    ]
    
    task_ids = []
    for task_data in demo_tasks:
        result = await repo.create_task(task_data)
        if result and result.inserted_id:
            task_ids.append(str(result.inserted_id))
            print(f"Created task: {task_data['title']}")
        else:
            print(f"Failed to create task: {task_data['title']}")
    
    return task_ids

async def create_demo_sessions(repo: MongoDBRepository, agent_ids: List[str]) -> List[str]:
    """Create demo sessions"""
    print("Creating demo sessions...")
    
    sessions = [
        {
            "agent_id": agent_ids[0] if agent_ids else "demo_agent_1",
            "user_id": "user_123",
            "session_type": "customer_support",
            "status": "completed",
            "started_at": datetime.utcnow() - timedelta(hours=3),
            "ended_at": datetime.utcnow() - timedelta(hours=2, minutes=45),
            "duration_minutes": 15,
            "message_count": 8,
            "satisfaction_rating": 5,
            "resolution_achieved": True,
            "summary": "Customer successfully resolved billing inquiry with agent assistance",
            "messages": [
                {
                    "role": "user",
                    "content": {"text": "Hi, I have a question about my recent bill"},
                    "timestamp": datetime.utcnow() - timedelta(hours=3)
                },
                {
                    "role": "agent",
                    "content": {
                        "text_response": "Hello! I'd be happy to help you with your billing question. Could you please provide me with your account number?",
                        "audio_generated": True,
                        "provider_used": "elevenlabs"
                    },
                    "timestamp": datetime.utcnow() - timedelta(hours=2, minutes=58)
                }
            ]
        },
        {
            "agent_id": agent_ids[1] if len(agent_ids) > 1 else "demo_agent_2",
            "user_id": "user_456",
            "session_type": "sales_call",
            "status": "active",
            "started_at": datetime.utcnow() - timedelta(minutes=20),
            "message_count": 12,
            "current_phase": "discovery",
            "lead_score": 85,
            "summary": "Promising enterprise lead, currently in discovery phase",
            "messages": [
                {
                    "role": "agent",
                    "content": {
                        "text_response": "Welcome to our discovery call! I'm excited to learn more about your business needs.",
                        "audio_generated": True,
                        "provider_used": "openai"
                    },
                    "timestamp": datetime.utcnow() - timedelta(minutes=20)
                },
                {
                    "role": "user",
                    "content": {"text": "Thanks! We're looking for a solution to streamline our customer support operations."},
                    "timestamp": datetime.utcnow() - timedelta(minutes=19)
                }
            ]
        }
    ]
    
    session_ids = []
    for session_data in sessions:
        result = await repo.create_session(session_data)
        if result and result.inserted_id:
            session_ids.append(str(result.inserted_id))
            print(f"Created session: {session_data['session_type']}")
        else:
            print(f"Failed to create session: {session_data['session_type']}")
    
    return session_ids

async def main():
    """Main function to create all demo data"""
    print("Starting demo data creation...")
    
    # Initialize repository
    repo = MongoDBRepository()
    
    try:
        # Connect to MongoDB
        await repo.connect()
        
        # Create indexes
        await repo.create_indexes()
        
        # Create demo data
        agent_ids = await create_demo_agents(repo)
        workflow_ids = await create_demo_workflows(repo, agent_ids)
        task_ids = await create_demo_tasks(repo, workflow_ids)
        session_ids = await create_demo_sessions(repo, agent_ids)
        
        print("\n=== Demo Data Creation Summary ===")
        print(f"Agents created: {len(agent_ids)}")
        print(f"Workflows created: {len(workflow_ids)}")
        print(f"Tasks created: {len(task_ids)}")
        print(f"Sessions created: {len(session_ids)}")
        print("\nDemo data creation completed successfully!")
        
    except Exception as e:
        print(f"Error creating demo data: {e}")
        raise
    finally:
        # Disconnect from MongoDB
        await repo.disconnect()

if __name__ == "__main__":
    asyncio.run(main())