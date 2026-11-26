import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const SubscriptionPage = () => {
  const { user } = useAuth();
  const [subData, setSubData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [checkoutModal, setCheckoutModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const fetchSubscription = () => {
    const token = localStorage.getItem('careflow_token');
    fetch('/api/hospital/subscription', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setSubData(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleSimulatedUpgrade = async () => {
    setUpgrading(true);
    const token = localStorage.getItem('careflow_token');
    try {
      const res = await fetch('/api/hospital/subscription/upgrade', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setCheckoutModal(false);
        setSuccessModal(true);
        fetchSubscription();
      }
    } catch (err) {
      alert('Upgrade error: ' + err.message);
    } finally {
      setUpgrading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-gray-400">Loading subscription details...</div>;
  }

  const { currentPlan, plans = [] } = subData;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-health-600" />
          <h1 className="text-2xl font-bold text-navy-800">Hospital Subscription & Plans</h1>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          CareFlow provides transparent operational queue intelligence for healthcare facilities.
        </p>
      </div>

      {/* Mandatory Pricing Hypothesis Warning Banner */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-amber-950">Pricing Notice:</strong> All figures shown below represent an <em>initial pricing hypothesis, not validated market prices</em>. Payment checkout is simulated for this investor demonstration.
        </p>
      </div>

      {/* Current Status Pill */}
      <div className="p-4 bg-white rounded-card border border-gray-200 shadow-subtle flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-xs text-gray-400 font-medium">Active Subscription</span>
          <h3 className="text-base font-bold text-navy-800">
            {currentPlan === 'Professional' ? 'Professional Plan' : 'Starter Plan'}
          </h3>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          Active Pilot Subscription
        </span>
      </div>

      {/* Plans Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((p) => {
          const isCurrent = p.isCurrent;
          const isPro = p.id === 'Professional';

          return (
            <div
              key={p.id}
              className={`rounded-card p-6 sm:p-8 flex flex-col justify-between border transition-all ${
                isPro
                  ? 'bg-white border-health-500 shadow-card ring-1 ring-health-500 relative'
                  : 'bg-white border-gray-200 shadow-subtle'
              }`}
            >
              {p.badge && (
                <span className="absolute -top-3 right-6 bg-health-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow-xs">
                  {p.badge}
                </span>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-navy-800">{p.name}</h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-extrabold text-navy-800">
                      {p.priceMonthly}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-700 block mt-0.5">
                    Initial pricing hypothesis
                  </span>
                </div>

                <ul className="space-y-2.5 text-xs text-gray-600 pt-4 border-t border-gray-100">
                  {p.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-8">
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-2.5 px-4 rounded-xl bg-gray-100 text-gray-500 text-xs font-bold cursor-default"
                  >
                    Current Active Plan
                  </button>
                ) : (
                  <button
                    onClick={() => setCheckoutModal(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-health-600 hover:bg-health-700 text-white text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Upgrade to Professional</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Checkout Modal */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-health-50 text-health-600 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-800">Simulate Checkout</h3>
                <p className="text-xs text-gray-500">Professional Tier Upgrade</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Selected Plan:</span>
                <strong className="text-navy-800">Professional (Monthly)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Hypothetical Subscription Fee:</span>
                <strong className="text-navy-800">₹25,000 / month</strong>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-1 text-[11px] text-amber-700">
                <span>Demo mode:</span>
                <span>No real charge applied</span>
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Clicking below will simulate a successful transaction, immediately unlocking real-time bed capacity reporting, diagnostic queues, and demand analytics.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCheckoutModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSimulatedUpgrade}
                disabled={upgrading}
                className="px-5 py-2.5 rounded-xl bg-health-600 text-white text-xs font-bold hover:bg-health-700 shadow-sm flex items-center gap-1.5"
              >
                <span>{upgrading ? 'Confirming...' : 'Complete Upgrade'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-card p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-navy-800">Upgrade Successful!</h3>
            <p className="text-xs text-gray-600">
              Your hospital has been upgraded to the <strong>Professional Plan</strong>. Bed availability, diagnostic lab queue updates, and hourly demand analytics are now fully unlocked.
            </p>
            <button
              onClick={() => setSuccessModal(false)}
              className="w-full py-2.5 rounded-xl bg-navy-800 text-white text-xs font-bold hover:bg-navy-900"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
