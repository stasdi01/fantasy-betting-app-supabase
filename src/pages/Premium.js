import React from 'react';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast/ToastProvider';
import SubscriptionCard from '../components/Premium/SubscriptionCard';
import { supabase } from '../lib/supabase';
import '../styles/Premium.css';

const Premium = () => {
  const { profile, updateProfile } = useAuth();
  const { success, error: showError } = useToast();

  const plans = [
    {
      id: 'free',
      name: 'FREE',
      price: '€0',
      period: '',
      description: 'Perfect for casual predictions',
      features: [
        'Make bets',
        'Track your profit',
        'Access to BetLeague',
        'Access to MyTeam League',
        'Bet History (only last 7 days)',
        'Only one team for MyTeam League'
      ],
      limitations: [
        'Limited bet history',
        'Cannot create custom leagues',
        'Cannot join custom leagues'
      ]
    },
    {
      id: 'pro',
      name: 'PRO',
      price: '€5',
      period: '/month',
      description: 'For competitive players',
      featured: true,
      features: [
        'Everything from FREE',
        'Create your own league (up to 2)',
        'Maximum 10 people per league',
        'Customize league names',
        'Premium badge next to username',
        'Full Bet History',
        'Three teams per MyTeam League'
      ],
      limitations: [
        'Limited to 2 custom leagues',
        'No VIP Team access'
      ]
    },
    {
      id: 'max',
      name: 'MAX',
      price: '€10',
      period: '/month',
      description: 'Ultimate betting experience',
      features: [
        'Everything from PRO',
        'Create unlimited custom leagues',
        'Maximum 100 people per league',
        'Customize league rules',
        'Access to VIP Team (Hall of Fame)',
        'Maximum 5 teams per MyTeam League'
      ],
      limitations: []
    }
  ];

  const handleSubscribe = async (plan) => {
    try {
      if (plan.id === 'free') {
        // Downgrade to free
        const { error } = await supabase
          .from('users')
          .update({
            role: 'free',
            premium_expires_at: null
          })
          .eq('id', profile.id);

        if (error) throw error;

        await updateProfile({
          role: 'free',
          premium_expires_at: null
        });

        success("Successfully downgraded to Free plan");
      } else {
        // Upgrade to pro or max
        const premiumExpiry = new Date();
        premiumExpiry.setMonth(premiumExpiry.getMonth() + 1); // 1 month from now

        const { error } = await supabase
          .from('users')
          .update({
            role: plan.id, // 'pro' or 'max'
            premium_expires_at: premiumExpiry.toISOString()
          })
          .eq('id', profile.id);

        if (error) throw error;

        await updateProfile({
          role: plan.id,
          premium_expires_at: premiumExpiry.toISOString()
        });

        success(`Successfully upgraded to ${plan.name}! Welcome to the ${plan.name.toLowerCase()} experience!`);
      }
    } catch (error) {
      console.error('Subscription error:', error);
      showError(error.message || 'Failed to update subscription');
      throw error;
    }
  };

  return (
    <div className="premium-container">
      <div className="premium-header">
        <Zap size={64} className="premium-icon" />
        <h1>Premium Plans</h1>
        <p>
          Choose the plan that fits your prediction style. Upgrade anytime to unlock more features
          and enhance your DreamStakes experience.
        </p>
      </div>

      <div className="plans-grid">
        {plans.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            onSubscribe={handleSubscribe}
          />
        ))}
      </div>

      <div className="premium-info">
        <h3>Why Upgrade?</h3>
        <p>
          Premium features help you create more engaging competitions with friends and family.
          Build custom leagues, track detailed statistics, and access exclusive insights from
          top performers. All subscriptions support the development of new features and keep
          DreamStakes running smoothly.
        </p>

        <div className="benefits-grid">
          <div className="benefit-item">
            <h4>🏆 Custom Leagues</h4>
            <p>Create private competitions with your friends and family</p>
          </div>
          <div className="benefit-item">
            <h4>📊 Advanced Stats</h4>
            <p>Get detailed insights into your prediction performance</p>
          </div>
          <div className="benefit-item">
            <h4>👑 Premium Badge</h4>
            <p>Show off your premium status with a special badge</p>
          </div>
          <div className="benefit-item">
            <h4>⚡ Priority Support</h4>
            <p>Get faster help when you need it most</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Premium;