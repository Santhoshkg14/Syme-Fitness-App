import { IUser } from '../../models/SymeSchemas';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: 'free' | 'premium';
  trialDaysLeft: number;
  message: string;
}

export class SymeSaaS {
  /**
   * Handles Razorpay subscription webhooks.
   * Logic:
   * 1. Verify webhook signature.
   * 2. Update user subscription status.
   * 3. Handle payment failure recovery.
   */
  static async handleWebhook(payload: any): Promise<boolean> {
    // Mock Razorpay Webhook Logic
    const { event, payload: data } = payload;
    
    if (event === 'subscription.charged') {
      // Update User in DB
      // const user = await User.findOne({ 'subscription.razorpayId': data.subscription.id });
      // user.subscription.status = 'active';
      // await user.save();
      return true;
    }
    
    if (event === 'subscription.halted') {
      // Handle payment failure
      return false;
    }
    
    return true;
  }

  /**
   * Checks if a feature is gated for the user.
   * Logic:
   * 1. Free vs Premium feature gating middleware.
   * 2. Trial lifecycle.
   */
  static checkFeatureAccess(user: IUser, feature: string): boolean {
    const premiumFeatures = ['ai-food-tracking', 'advanced-analytics', 'personalized-workout-generation'];
    
    if (user.subscription.plan === 'premium' && user.subscription.status === 'active') {
      return true;
    }
    
    if (user.subscription.status === 'trial') {
      const now = new Date();
      if (user.subscription.expiresAt > now) {
        return true;
      }
    }
    
    return !premiumFeatures.includes(feature);
  }

  /**
   * Gets the subscription status for a user.
   */
  static getSubscriptionStatus(user: IUser): SubscriptionStatus {
    const now = new Date();
    const trialDaysLeft = Math.max(0, Math.ceil((user.subscription.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    
    let message = "You're on the Free plan. Upgrade to unlock AI features!";
    if (user.subscription.status === 'active') {
      message = "You're a Premium member! Enjoy all AI features.";
    } else if (user.subscription.status === 'trial') {
      message = `You're on a 7-day trial. ${trialDaysLeft} days left.`;
    }
    
    return {
      isActive: user.subscription.status === 'active' || (user.subscription.status === 'trial' && trialDaysLeft > 0),
      plan: user.subscription.plan,
      trialDaysLeft,
      message
    };
  }
}
