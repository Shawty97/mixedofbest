#!/usr/bin/env python3
"""
Demo Data Creation Script
Creates sample agents, workflows, tasks, and sessions for demonstration purposes.
"""

import asyncio
import sys
import os
from datetime import datetime, timedelta, timezone
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
            },
            "metrics": {
                "conversations": 1247,
                "success_rate": 0.985,
                "avg_response_time": 142,
                "customer_satisfaction": 4.8
            },
            "status": "active",
            "created_at": datetime.now(timezone.utc) - timedelta(days=30),
            "last_active": datetime.now(timezone.utc) - timedelta(minutes=2)
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
            },
            "metrics": {
                "conversations": 892,
                "success_rate": 0.967,
                "avg_response_time": 89,
                "customer_satisfaction": 4.9
            },
            "status": "active",
            "created_at": datetime.now(timezone.utc) - timedelta(days=25),
            "last_active": datetime.now(timezone.utc) - timedelta(minutes=5)
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
            },
            "metrics": {
                "conversations": 567,
                "success_rate": 0.943,
                "avg_response_time": 203,
                "customer_satisfaction": 4.7
            },
            "status": "active",
            "created_at": datetime.now(timezone.utc) - timedelta(days=20),
            "last_active": datetime.now(timezone.utc) - timedelta(minutes=15)
        },
        {
            "agent_id": "healthcare_assistant_001",
             "agent_type": "healthcare_assistant",
            "name": "Healthcare Helper Hannah",
            "description": "HIPAA-compliant healthcare assistant for patient support and appointment scheduling",
            "type": "healthcare",
            "capabilities": ["appointment_scheduling", "symptom_assessment", "medication_reminders", "health_education"],
            "personality": {
                "tone": "caring",
                "style": "empathetic",
                "energy_level": "calm"
            },
            "configuration": {
                "voice_enabled": True,
                "language": "en",
                "response_time": "careful",
                "compliance": "HIPAA"
            },
            "metrics": {
                "conversations": 1834,
                "success_rate": 0.991,
                "avg_response_time": 156,
                "customer_satisfaction": 4.9
            },
            "status": "active",
            "created_at": datetime.now(timezone.utc) - timedelta(days=45),
            "last_active": datetime.now(timezone.utc) - timedelta(minutes=1)
        },
        {
            "agent_id": "finance_advisor_001",
             "agent_type": "financial_advisor",
            "name": "Finance Expert Felix",
            "description": "AI financial advisor for investment guidance and portfolio management",
            "type": "finance",
            "capabilities": ["investment_analysis", "risk_assessment", "portfolio_optimization", "market_insights"],
            "personality": {
                "tone": "analytical",
                "style": "data-driven",
                "energy_level": "focused"
            },
            "configuration": {
                "voice_enabled": True,
                "language": "en",
                "response_time": "analytical",
                "compliance": "SEC"
            },
            "metrics": {
                "conversations": 723,
                "success_rate": 0.978,
                "avg_response_time": 234,
                "customer_satisfaction": 4.8
            },
            "status": "active",
            "created_at": datetime.now(timezone.utc) - timedelta(days=35),
            "last_active": datetime.now(timezone.utc) - timedelta(minutes=8)
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
            "workflow_id": "onboarding_flow_001",
            "name": "Customer Onboarding Workflow",
            "description": "Complete customer onboarding process with multiple touchpoints",
            "type": "onboarding",
            "status": "active",
            "estimated_duration": 15,
            "steps": [
                {
                    "step_id": "welcome",
                    "name": "Welcome Message",
                    "type": "message",
                    "assigned_agent_id": "hr_bot_001",
                    "order": 1
                },
                {
                    "step_id": "data_collection",
                    "name": "Collect User Information",
                    "type": "form",
                    "agent_id": "hr_bot_001",
                    "order": 2
                },
                {
                    "step_id": "setup_account",
                    "name": "Account Setup",
                    "type": "automation",
                    "agent_id": "hr_bot_001",
                    "order": 3
                }
            ],
            "metrics": {
                "total_executions": 1247,
                "success_rate": 0.94,
                "avg_completion_time": 342,
                "active_instances": 23
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=30),
            "last_executed": datetime.now(timezone.utc) - timedelta(minutes=5)
        },
        {
            "workflow_id": "sales_qualification_001",
            "name": "Lead Qualification Process",
            "description": "Automated lead qualification and scoring workflow",
            "type": "sales",
            "status": "active",
            "estimated_duration": 30,
            "steps": [
                {
                    "step_id": "initial_contact",
                    "name": "Initial Contact",
                    "type": "call",
                    "assigned_agent_id": "sales_assistant_001",
                    "order": 1
                },
                {
                    "step_id": "needs_assessment",
                    "name": "Needs Assessment",
                    "type": "conversation",
                    "agent_id": "sales_assistant_001",
                    "order": 2
                },
                {
                    "step_id": "proposal_generation",
                    "name": "Generate Proposal",
                    "type": "automation",
                    "agent_id": "sales_assistant_001",
                    "order": 3
                }
            ],
            "metrics": {
                "total_executions": 892,
                "success_rate": 0.87,
                "avg_completion_time": 1247,
                "active_instances": 45
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=25),
            "last_executed": datetime.now(timezone.utc) - timedelta(minutes=2)
        },
        {
            "workflow_id": "support_ticket_001",
            "name": "Support Ticket Resolution",
            "description": "Automated support ticket handling and resolution workflow",
            "type": "support",
            "status": "active",
            "estimated_duration": 20,
            "steps": [
                {
                    "step_id": "ticket_intake",
                    "name": "Ticket Intake",
                    "type": "form",
                    "assigned_agent_id": "support_agent_001",
                    "order": 1
                },
                {
                    "step_id": "issue_diagnosis",
                    "name": "Issue Diagnosis",
                    "type": "analysis",
                    "agent_id": "support_agent_001",
                    "order": 2
                },
                {
                    "step_id": "resolution_delivery",
                    "name": "Deliver Resolution",
                    "type": "response",
                    "agent_id": "support_agent_001",
                    "order": 3
                }
            ],
            "metrics": {
                "total_executions": 2134,
                "success_rate": 0.91,
                "avg_completion_time": 567,
                "active_instances": 67
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=20),
            "last_executed": datetime.now(timezone.utc) - timedelta(minutes=1)
        },
        {
            "workflow_id": "healthcare_appointment_001",
            "name": "Healthcare Appointment Scheduling",
            "description": "HIPAA-compliant patient appointment scheduling and reminder workflow",
            "type": "healthcare",
            "status": "active",
            "estimated_duration": 25,
            "steps": [
                {
                    "step_id": "patient_verification",
                    "name": "Patient Identity Verification",
                    "type": "verification",
                    "assigned_agent_id": "healthcare_assistant_001",
                    "order": 1
                },
                {
                    "step_id": "symptom_assessment",
                    "name": "Initial Symptom Assessment",
                    "type": "conversation",
                    "agent_id": "healthcare_assistant_001",
                    "order": 2
                },
                {
                    "step_id": "appointment_booking",
                    "name": "Schedule Appointment",
                    "type": "booking",
                    "agent_id": "healthcare_assistant_001",
                    "order": 3
                },
                {
                    "step_id": "reminder_setup",
                    "name": "Setup Appointment Reminders",
                    "type": "automation",
                    "agent_id": "healthcare_assistant_001",
                    "order": 4
                }
            ],
            "metrics": {
                "total_executions": 1834,
                "success_rate": 0.96,
                "avg_completion_time": 423,
                "active_instances": 89
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=45),
            "last_executed": datetime.now(timezone.utc) - timedelta(minutes=3)
        },
        {
            "workflow_id": "financial_advisory_001",
            "name": "Investment Portfolio Analysis",
            "description": "Automated investment analysis and portfolio optimization workflow",
            "type": "finance",
            "status": "active",
            "estimated_duration": 45,
            "steps": [
                {
                    "step_id": "risk_assessment",
                    "name": "Risk Tolerance Assessment",
                    "type": "questionnaire",
                    "assigned_agent_id": "finance_advisor_001",
                    "order": 1
                },
                {
                    "step_id": "portfolio_analysis",
                    "name": "Current Portfolio Analysis",
                    "type": "analysis",
                    "agent_id": "finance_advisor_001",
                    "order": 2
                },
                {
                    "step_id": "recommendation_generation",
                    "name": "Generate Investment Recommendations",
                    "type": "automation",
                    "agent_id": "finance_advisor_001",
                    "order": 3
                },
                {
                    "step_id": "compliance_check",
                    "name": "Regulatory Compliance Check",
                    "type": "validation",
                    "agent_id": "finance_advisor_001",
                    "order": 4
                }
            ],
            "metrics": {
                "total_executions": 723,
                "success_rate": 0.93,
                "avg_completion_time": 1456,
                "active_instances": 34
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=35),
            "last_executed": datetime.now(timezone.utc) - timedelta(minutes=8)
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
            "task_id": "welcome_new_user_001",
            "workflow_id": "onboarding_flow_001",
            "agent_id": "hr_bot_001",
            "type": "message",
            "title": "Send Welcome Message",
            "description": "Send personalized welcome message to new user",
            "status": "completed",
            "priority": "high",
            "input_data": {
                "user_name": "John Doe",
                "user_email": "john.doe@example.com",
                "signup_date": "2024-01-15"
            },
            "output_data": {
                "message_sent": True,
                "delivery_status": "delivered",
                "response_received": True
            },
            "metrics": {
                "execution_time": 1.2,
                "success_rate": 0.98,
                "user_engagement": 0.87
            },
            "created_at": datetime.now(timezone.utc) - timedelta(hours=2),
            "completed_at": datetime.now(timezone.utc) - timedelta(hours=1, minutes=58)
        },
        {
            "task_id": "technical_assessment_001",
            "workflow_id": "support_ticket_001",
            "agent_id": "support_agent_001",
            "type": "analysis",
            "title": "Technical Issue Assessment",
            "description": "Analyze and diagnose technical support issue",
            "status": "in_progress",
            "priority": "medium",
            "input_data": {
                "ticket_id": "TECH-2024-001",
                "issue_category": "login_problem",
                "user_description": "Cannot access account after password reset"
            },
            "output_data": {
                "diagnosis": "Password reset token expired",
                "recommended_solution": "Generate new reset token",
                "estimated_resolution_time": 15
            },
            "metrics": {
                "execution_time": 3.7,
                "accuracy_score": 0.94,
                "customer_satisfaction": 4.6
            },
            "created_at": datetime.now(timezone.utc) - timedelta(minutes=45),
            "started_at": datetime.now(timezone.utc) - timedelta(minutes=42)
        },
        {
            "task_id": "product_demo_001",
            "workflow_id": "sales_qualification_001",
            "agent_id": "sales_assistant_001",
            "type": "presentation",
            "title": "Product Demonstration",
            "description": "Conduct interactive product demonstration for qualified lead",
            "status": "scheduled",
            "priority": "high",
            "input_data": {
                "lead_id": "LEAD-2024-001",
                "company_name": "TechCorp Solutions",
                "demo_focus": "enterprise_features",
                "scheduled_time": "2024-01-20T14:00:00Z"
            },
            "output_data": {
                "demo_completed": False,
                "follow_up_scheduled": True,
                "interest_level": "high"
            },
            "metrics": {
                "conversion_probability": 0.78,
                "engagement_score": 0.92,
                "demo_duration": 45
            },
            "created_at": datetime.now(timezone.utc) - timedelta(days=1),
            "scheduled_for": datetime.now(timezone.utc) + timedelta(hours=3)
        },
        {
            "task_id": "patient_appointment_001",
            "workflow_id": "healthcare_appointment_001",
            "agent_id": "healthcare_assistant_001",
            "type": "scheduling",
            "title": "Schedule Patient Appointment",
            "description": "Schedule follow-up appointment for patient consultation",
            "status": "completed",
            "priority": "high",
            "input_data": {
                "patient_id": "PAT-2024-001",
                "appointment_type": "follow_up",
                "preferred_time": "morning",
                "symptoms": "persistent headaches"
            },
            "output_data": {
                "appointment_scheduled": True,
                "appointment_time": "2024-01-22T09:30:00Z",
                "doctor_assigned": "Dr. Smith",
                "reminder_set": True
            },
            "metrics": {
                "scheduling_efficiency": 0.96,
                "patient_satisfaction": 4.9,
                "compliance_score": 1.0
            },
            "created_at": datetime.now(timezone.utc) - timedelta(hours=6),
            "completed_at": datetime.now(timezone.utc) - timedelta(hours=5, minutes=45)
        },
        {
            "task_id": "portfolio_analysis_001",
            "workflow_id": "financial_advisory_001",
            "agent_id": "finance_advisor_001",
            "type": "analysis",
            "title": "Investment Portfolio Analysis",
            "description": "Comprehensive analysis of client's investment portfolio",
            "status": "completed",
            "priority": "medium",
            "input_data": {
                "client_id": "CLIENT-2024-001",
                "portfolio_value": 250000,
                "risk_tolerance": "moderate",
                "investment_goals": "retirement_planning"
            },
            "output_data": {
                "analysis_complete": True,
                "recommendations_generated": 8,
                "risk_score": 6.2,
                "expected_return": 0.087
            },
            "metrics": {
                "analysis_accuracy": 0.94,
                "recommendation_quality": 0.91,
                "compliance_check": True
            },
            "created_at": datetime.now(timezone.utc) - timedelta(hours=4),
            "completed_at": datetime.now(timezone.utc) - timedelta(hours=3, minutes=15)
        },
        {
            "task_id": "lead_qualification_001",
            "workflow_id": "sales_qualification_001",
            "agent_id": "sales_assistant_001",
            "type": "qualification",
            "title": "Lead Qualification Assessment",
            "description": "Assess and score incoming sales lead",
            "status": "in_progress",
            "priority": "high",
            "input_data": {
                "lead_source": "website_form",
                "company_size": "50-200",
                "budget_range": "10k-50k",
                "timeline": "Q2_2024"
            },
            "output_data": {
                "qualification_score": 85,
                "lead_grade": "A",
                "next_action": "schedule_demo"
            },
            "metrics": {
                "qualification_accuracy": 0.89,
                "conversion_probability": 0.72,
                "response_time": 2.3
            },
            "created_at": datetime.now(timezone.utc) - timedelta(minutes=25),
            "started_at": datetime.now(timezone.utc) - timedelta(minutes=22)
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
            "started_at": datetime.now(timezone.utc) - timedelta(hours=3),
            "ended_at": datetime.now(timezone.utc) - timedelta(hours=2, minutes=45),
            "duration_minutes": 15,
            "message_count": 8,
            "satisfaction_rating": 5,
            "resolution_achieved": True,
            "summary": "Customer successfully resolved billing inquiry with agent assistance",
            "messages": [
                {
                    "role": "user",
                    "content": {"text": "Hi, I have a question about my recent bill"},
                    "timestamp": datetime.now(timezone.utc) - timedelta(hours=3)
                },
                {
                    "role": "agent",
                    "content": {
                        "text_response": "Hello! I'd be happy to help you with your billing question. Could you please provide me with your account number?",
                        "audio_generated": True,
                        "provider_used": "elevenlabs"
                    },
                    "timestamp": datetime.now(timezone.utc) - timedelta(hours=2, minutes=58)
                }
            ]
        },
        {
            "agent_id": agent_ids[1] if len(agent_ids) > 1 else "demo_agent_2",
            "user_id": "user_456",
            "session_type": "sales_call",
            "status": "active",
            "started_at": datetime.now(timezone.utc) - timedelta(minutes=20),
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
                    "timestamp": datetime.now(timezone.utc) - timedelta(minutes=20)
                },
                {
                    "role": "user",
                    "content": {"text": "Thanks! We're looking for a solution to streamline our customer support operations."},
                    "timestamp": datetime.now(timezone.utc) - timedelta(minutes=19)
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