import React, { useState } from "react";
import { Crown, Check, Zap, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../Toast/ToastProvider";
import LoadingSpinner from "../Loading/LoadingSpinner";
import "../../styles/SubscriptionCard.css";

const SubscriptionCard = ({ plan, onSubscribe }) => {
  const { profile, isPremium } = useAuth();
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(false);

  const isCurrentPlan = () => {
    if (plan.id === 'free') return !isPremium;
    if (plan.id === 'premium') return isPremium;
    return false;
  };

  const handleSubscribe = async () => {
    if (isCurrentPlan()) return;

    setLoading(true);
    try {
      await onSubscribe(plan);
      success(`Successfully subscribed to ${plan.name} plan!`);
    } catch (error) {
      showError(error.message || "Failed to subscribe");
    }
    setLoading(false);
  };

  const getButtonText = () => {
    if (isCurrentPlan()) return "Current Plan";
    if (plan.id === 'free') return "Downgrade";
    return "Upgrade";
  };

  const getButtonVariant = () => {
    if (isCurrentPlan()) return "current";
    if (plan.id === 'free') return "secondary";
    return "primary";
  };

  return (
    <div className={`subscription-card ${plan.featured ? "featured" : ""} ${isCurrentPlan() ? "current" : ""}`}>
      {plan.featured && (
        <div className="featured-badge">
          <Crown size={16} />
          Most Popular
        </div>
      )}

      <div className="plan-header">
        <div className="plan-icon">
          {plan.id === 'free' ? <Zap size={24} /> : <Crown size={24} />}
        </div>
        <h3>{plan.name}</h3>
        <p className="plan-description">{plan.description}</p>
      </div>

      <div className="plan-pricing">
        <span className="price">{plan.price}</span>
        <span className="period">{plan.period}</span>
      </div>

      <div className="plan-features">
        <h4>Features included:</h4>
        <ul>
          {plan.features.map((feature, index) => (
            <li key={index}>
              <Check size={16} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {plan.limitations && plan.limitations.length > 0 && (
        <div className="plan-limitations">
          <h4>Limitations:</h4>
          <ul>
            {plan.limitations.map((limitation, index) => (
              <li key={index}>
                <AlertCircle size={16} />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        className={`subscribe-button ${getButtonVariant()}`}
        onClick={handleSubscribe}
        disabled={loading || isCurrentPlan()}
      >
        {loading ? (
          <LoadingSpinner size="sm" color="white" />
        ) : (
          getButtonText()
        )}
      </button>

      {isCurrentPlan() && isPremium && profile?.premium_expires_at && (
        <div className="expiry-info">
          <AlertCircle size={14} />
          <span>
            Expires: {new Date(profile.premium_expires_at).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  );
};

export default SubscriptionCard;