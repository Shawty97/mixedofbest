from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List
import stripe
import os
from datetime import datetime

# Initialize Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

router = APIRouter()

# Pydantic models
class CreateSubscriptionRequest(BaseModel):
    price_id: str
    customer_email: str
    customer_name: Optional[str] = None
    payment_method_id: Optional[str] = None

class CreatePaymentIntentRequest(BaseModel):
    amount: int  # in cents
    currency: str = "usd"
    customer_id: Optional[str] = None
    description: Optional[str] = None

class UpdateSubscriptionRequest(BaseModel):
    subscription_id: str
    new_price_id: str

class WebhookEvent(BaseModel):
    type: str
    data: dict

# Pricing tiers
PRICING_TIERS = {
    "starter": {
        "name": "Starter",
        "price": 99,
        "features": [
            "5 voice agents",
            "1,000 conversations/month",
            "Basic analytics",
            "Email support"
        ]
    },
    "professional": {
        "name": "Professional", 
        "price": 299,
        "features": [
            "25 voice agents",
            "10,000 conversations/month",
            "Advanced analytics",
            "Priority support",
            "Custom integrations"
        ]
    },
    "enterprise": {
        "name": "Enterprise",
        "price": 999,
        "features": [
            "Unlimited voice agents",
            "Unlimited conversations",
            "White-label solution",
            "24/7 dedicated support",
            "Custom development"
        ]
    }
}

@router.get("/pricing")
async def get_pricing():
    """Get available pricing tiers"""
    return {"pricing_tiers": PRICING_TIERS}

@router.post("/create-customer")
async def create_customer(email: str, name: Optional[str] = None):
    """Create a new Stripe customer"""
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata={
                "platform": "universal_agent_platform",
                "created_at": datetime.utcnow().isoformat()
            }
        )
        return {
            "customer_id": customer.id,
            "email": customer.email,
            "name": customer.name
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-payment-intent")
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """Create a payment intent for one-time payments"""
    try:
        intent = stripe.PaymentIntent.create(
            amount=request.amount,
            currency=request.currency,
            customer=request.customer_id,
            description=request.description,
            metadata={
                "platform": "universal_agent_platform"
            }
        )
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/create-subscription")
async def create_subscription(request: CreateSubscriptionRequest):
    """Create a new subscription"""
    try:
        # Create customer if not exists
        customer = stripe.Customer.create(
            email=request.customer_email,
            name=request.customer_name,
            metadata={
                "platform": "universal_agent_platform"
            }
        )
        
        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{
                'price': request.price_id,
            }],
            payment_behavior='default_incomplete',
            payment_settings={'save_default_payment_method': 'on_subscription'},
            expand=['latest_invoice.payment_intent'],
            metadata={
                "platform": "universal_agent_platform"
            }
        )
        
        return {
            "subscription_id": subscription.id,
            "customer_id": customer.id,
            "client_secret": subscription.latest_invoice.payment_intent.client_secret,
            "status": subscription.status
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/subscription/{subscription_id}")
async def get_subscription(subscription_id: str):
    """Get subscription details"""
    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        return {
            "id": subscription.id,
            "status": subscription.status,
            "current_period_start": subscription.current_period_start,
            "current_period_end": subscription.current_period_end,
            "customer_id": subscription.customer,
            "items": [{
                "price_id": item.price.id,
                "quantity": item.quantity
            } for item in subscription.items.data]
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/subscription/{subscription_id}")
async def update_subscription(subscription_id: str, request: UpdateSubscriptionRequest):
    """Update subscription (upgrade/downgrade)"""
    try:
        subscription = stripe.Subscription.retrieve(subscription_id)
        
        stripe.Subscription.modify(
            subscription_id,
            items=[{
                'id': subscription['items']['data'][0].id,
                'price': request.new_price_id,
            }],
            proration_behavior='create_prorations'
        )
        
        updated_subscription = stripe.Subscription.retrieve(subscription_id)
        return {
            "subscription_id": updated_subscription.id,
            "status": updated_subscription.status,
            "message": "Subscription updated successfully"
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/subscription/{subscription_id}")
async def cancel_subscription(subscription_id: str):
    """Cancel a subscription"""
    try:
        subscription = stripe.Subscription.delete(subscription_id)
        return {
            "subscription_id": subscription.id,
            "status": subscription.status,
            "message": "Subscription cancelled successfully"
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/customer/{customer_id}/subscriptions")
async def get_customer_subscriptions(customer_id: str):
    """Get all subscriptions for a customer"""
    try:
        subscriptions = stripe.Subscription.list(customer=customer_id)
        return {
            "subscriptions": [{
                "id": sub.id,
                "status": sub.status,
                "current_period_start": sub.current_period_start,
                "current_period_end": sub.current_period_end,
                "items": [{
                    "price_id": item.price.id,
                    "quantity": item.quantity
                } for item in sub.items.data]
            } for sub in subscriptions.data]
        }
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        print(f"Payment succeeded: {payment_intent['id']}")
        # TODO: Update user's subscription status in database
        
    elif event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        print(f"Subscription created: {subscription['id']}")
        # TODO: Activate user's subscription in database
        
    elif event['type'] == 'customer.subscription.updated':
        subscription = event['data']['object']
        print(f"Subscription updated: {subscription['id']}")
        # TODO: Update user's subscription in database
        
    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        print(f"Subscription cancelled: {subscription['id']}")
        # TODO: Deactivate user's subscription in database
        
    elif event['type'] == 'invoice.payment_failed':
        invoice = event['data']['object']
        print(f"Payment failed: {invoice['id']}")
        # TODO: Handle failed payment (send email, suspend service, etc.)
        
    else:
        print(f"Unhandled event type: {event['type']}")
    
    return {"status": "success"}

@router.get("/usage/{customer_id}")
async def get_usage_metrics(customer_id: str):
    """Get usage metrics for billing"""
    # TODO: Implement usage tracking from database
    # This would track conversations, API calls, etc.
    return {
        "customer_id": customer_id,
        "current_period": {
            "conversations": 0,
            "api_calls": 0,
            "voice_minutes": 0,
            "agents_created": 0
        },
        "limits": {
            "conversations": 1000,
            "api_calls": 10000,
            "voice_minutes": 500,
            "agents_created": 5
        }
    }

@router.post("/create-portal-session")
async def create_portal_session(customer_id: str, return_url: str):
    """Create a Stripe customer portal session"""
    try:
        session = stripe.billing_portal.Session.create(
            customer=customer_id,
            return_url=return_url,
        )
        return {"url": session.url}
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))