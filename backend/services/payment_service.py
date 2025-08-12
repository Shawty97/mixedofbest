from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import stripe
import os
from dataclasses import dataclass

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

@dataclass
class UsageMetrics:
    conversations: int = 0
    api_calls: int = 0
    voice_minutes: float = 0.0
    agents_created: int = 0
    storage_mb: float = 0.0

@dataclass
class SubscriptionLimits:
    conversations: int
    api_calls: int
    voice_minutes: float
    agents_created: int
    storage_gb: float

@dataclass
class PricingTier:
    id: str
    name: str
    price: int  # in cents
    currency: str
    interval: str  # 'month' or 'year'
    limits: SubscriptionLimits
    features: List[str]
    stripe_price_id: Optional[str] = None

class PaymentService:
    def __init__(self):
        self.pricing_tiers = {
            "starter": PricingTier(
                id="starter",
                name="Starter",
                price=9900,  # $99.00
                currency="usd",
                interval="month",
                limits=SubscriptionLimits(
                    conversations=1000,
                    api_calls=10000,
                    voice_minutes=500,
                    agents_created=5,
                    storage_gb=1
                ),
                features=[
                    "5 voice agents",
                    "1,000 conversations/month",
                    "500 voice minutes",
                    "Basic analytics",
                    "Email support",
                    "1GB storage"
                ],
                stripe_price_id=os.getenv('STRIPE_STARTER_PRICE_ID')
            ),
            "professional": PricingTier(
                id="professional",
                name="Professional",
                price=29900,  # $299.00
                currency="usd",
                interval="month",
                limits=SubscriptionLimits(
                    conversations=10000,
                    api_calls=100000,
                    voice_minutes=5000,
                    agents_created=25,
                    storage_gb=10
                ),
                features=[
                    "25 voice agents",
                    "10,000 conversations/month",
                    "5,000 voice minutes",
                    "Advanced analytics",
                    "Priority support",
                    "Custom integrations",
                    "10GB storage",
                    "API access"
                ],
                stripe_price_id=os.getenv('STRIPE_PROFESSIONAL_PRICE_ID')
            ),
            "enterprise": PricingTier(
                id="enterprise",
                name="Enterprise",
                price=99900,  # $999.00
                currency="usd",
                interval="month",
                limits=SubscriptionLimits(
                    conversations=-1,  # unlimited
                    api_calls=-1,  # unlimited
                    voice_minutes=-1,  # unlimited
                    agents_created=-1,  # unlimited
                    storage_gb=100
                ),
                features=[
                    "Unlimited voice agents",
                    "Unlimited conversations",
                    "Unlimited voice minutes",
                    "White-label solution",
                    "24/7 dedicated support",
                    "Custom development",
                    "100GB storage",
                    "Advanced API access",
                    "SLA guarantee",
                    "On-premise deployment option"
                ],
                stripe_price_id=os.getenv('STRIPE_ENTERPRISE_PRICE_ID')
            )
        }
    
    def get_pricing_tiers(self) -> Dict[str, PricingTier]:
        """Get all available pricing tiers"""
        return self.pricing_tiers
    
    def get_tier_by_id(self, tier_id: str) -> Optional[PricingTier]:
        """Get a specific pricing tier by ID"""
        return self.pricing_tiers.get(tier_id)
    
    async def create_customer(self, email: str, name: Optional[str] = None, 
                            metadata: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
        """Create a new Stripe customer"""
        try:
            customer_metadata = {
                "platform": "universal_agent_platform",
                "created_at": datetime.utcnow().isoformat()
            }
            if metadata:
                customer_metadata.update(metadata)
            
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata=customer_metadata
            )
            
            return {
                "success": True,
                "customer_id": customer.id,
                "email": customer.email,
                "name": customer.name
            }
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def create_subscription(self, customer_id: str, tier_id: str, 
                                payment_method_id: Optional[str] = None) -> Dict[str, Any]:
        """Create a new subscription for a customer"""
        tier = self.get_tier_by_id(tier_id)
        if not tier or not tier.stripe_price_id:
            return {
                "success": False,
                "error": f"Invalid tier ID: {tier_id}"
            }
        
        try:
            subscription_data = {
                "customer": customer_id,
                "items": [{
                    "price": tier.stripe_price_id,
                }],
                "metadata": {
                    "platform": "universal_agent_platform",
                    "tier_id": tier_id,
                    "tier_name": tier.name
                }
            }
            
            if payment_method_id:
                subscription_data["default_payment_method"] = payment_method_id
                subscription_data["payment_behavior"] = "default_incomplete"
                subscription_data["expand"] = ["latest_invoice.payment_intent"]
            
            subscription = stripe.Subscription.create(**subscription_data)
            
            result = {
                "success": True,
                "subscription_id": subscription.id,
                "status": subscription.status,
                "tier_id": tier_id,
                "tier_name": tier.name
            }
            
            if hasattr(subscription, 'latest_invoice') and subscription.latest_invoice:
                if hasattr(subscription.latest_invoice, 'payment_intent'):
                    result["client_secret"] = subscription.latest_invoice.payment_intent.client_secret
            
            return result
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def update_subscription(self, subscription_id: str, new_tier_id: str) -> Dict[str, Any]:
        """Update subscription to a new tier"""
        new_tier = self.get_tier_by_id(new_tier_id)
        if not new_tier or not new_tier.stripe_price_id:
            return {
                "success": False,
                "error": f"Invalid tier ID: {new_tier_id}"
            }
        
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            
            stripe.Subscription.modify(
                subscription_id,
                items=[{
                    "id": subscription["items"]["data"][0].id,
                    "price": new_tier.stripe_price_id,
                }],
                proration_behavior="create_prorations",
                metadata={
                    "tier_id": new_tier_id,
                    "tier_name": new_tier.name,
                    "updated_at": datetime.utcnow().isoformat()
                }
            )
            
            updated_subscription = stripe.Subscription.retrieve(subscription_id)
            
            return {
                "success": True,
                "subscription_id": updated_subscription.id,
                "status": updated_subscription.status,
                "new_tier_id": new_tier_id,
                "new_tier_name": new_tier.name
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def cancel_subscription(self, subscription_id: str, 
                                immediately: bool = False) -> Dict[str, Any]:
        """Cancel a subscription"""
        try:
            if immediately:
                subscription = stripe.Subscription.delete(subscription_id)
            else:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            
            return {
                "success": True,
                "subscription_id": subscription.id,
                "status": subscription.status,
                "cancelled_immediately": immediately
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def get_customer_subscriptions(self, customer_id: str) -> Dict[str, Any]:
        """Get all subscriptions for a customer"""
        try:
            subscriptions = stripe.Subscription.list(customer=customer_id)
            
            subscription_list = []
            for sub in subscriptions.data:
                tier_id = sub.metadata.get("tier_id", "unknown")
                tier = self.get_tier_by_id(tier_id)
                
                subscription_list.append({
                    "id": sub.id,
                    "status": sub.status,
                    "tier_id": tier_id,
                    "tier_name": tier.name if tier else "Unknown",
                    "current_period_start": sub.current_period_start,
                    "current_period_end": sub.current_period_end,
                    "cancel_at_period_end": sub.cancel_at_period_end
                })
            
            return {
                "success": True,
                "subscriptions": subscription_list
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def check_usage_limits(self, tier_id: str, current_usage: UsageMetrics) -> Dict[str, Any]:
        """Check if current usage exceeds tier limits"""
        tier = self.get_tier_by_id(tier_id)
        if not tier:
            return {
                "valid": False,
                "error": f"Invalid tier ID: {tier_id}"
            }
        
        limits = tier.limits
        violations = []
        
        # Check each limit (-1 means unlimited)
        if limits.conversations != -1 and current_usage.conversations > limits.conversations:
            violations.append(f"Conversations: {current_usage.conversations}/{limits.conversations}")
        
        if limits.api_calls != -1 and current_usage.api_calls > limits.api_calls:
            violations.append(f"API calls: {current_usage.api_calls}/{limits.api_calls}")
        
        if limits.voice_minutes != -1 and current_usage.voice_minutes > limits.voice_minutes:
            violations.append(f"Voice minutes: {current_usage.voice_minutes}/{limits.voice_minutes}")
        
        if limits.agents_created != -1 and current_usage.agents_created > limits.agents_created:
            violations.append(f"Agents: {current_usage.agents_created}/{limits.agents_created}")
        
        if limits.storage_gb != -1 and current_usage.storage_mb > (limits.storage_gb * 1024):
            violations.append(f"Storage: {current_usage.storage_mb/1024:.2f}GB/{limits.storage_gb}GB")
        
        return {
            "valid": len(violations) == 0,
            "violations": violations,
            "usage": {
                "conversations": f"{current_usage.conversations}/{limits.conversations if limits.conversations != -1 else 'unlimited'}",
                "api_calls": f"{current_usage.api_calls}/{limits.api_calls if limits.api_calls != -1 else 'unlimited'}",
                "voice_minutes": f"{current_usage.voice_minutes}/{limits.voice_minutes if limits.voice_minutes != -1 else 'unlimited'}",
                "agents_created": f"{current_usage.agents_created}/{limits.agents_created if limits.agents_created != -1 else 'unlimited'}",
                "storage": f"{current_usage.storage_mb/1024:.2f}GB/{limits.storage_gb}GB"
            }
        }
    
    async def create_portal_session(self, customer_id: str, return_url: str) -> Dict[str, Any]:
        """Create a Stripe customer portal session"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            
            return {
                "success": True,
                "url": session.url
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def handle_webhook_event(self, event_type: str, event_data: Dict[str, Any]) -> Dict[str, Any]:
        """Handle Stripe webhook events"""
        try:
            if event_type == "customer.subscription.created":
                subscription = event_data["object"]
                # TODO: Activate user's subscription in database
                print(f"Subscription created: {subscription['id']}")
                
            elif event_type == "customer.subscription.updated":
                subscription = event_data["object"]
                # TODO: Update user's subscription in database
                print(f"Subscription updated: {subscription['id']}")
                
            elif event_type == "customer.subscription.deleted":
                subscription = event_data["object"]
                # TODO: Deactivate user's subscription in database
                print(f"Subscription cancelled: {subscription['id']}")
                
            elif event_type == "invoice.payment_succeeded":
                invoice = event_data["object"]
                # TODO: Update payment status in database
                print(f"Payment succeeded: {invoice['id']}")
                
            elif event_type == "invoice.payment_failed":
                invoice = event_data["object"]
                # TODO: Handle failed payment (send email, suspend service, etc.)
                print(f"Payment failed: {invoice['id']}")
                
            return {
                "success": True,
                "event_type": event_type,
                "processed": True
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "event_type": event_type
            }

# Global instance
payment_service = PaymentService()