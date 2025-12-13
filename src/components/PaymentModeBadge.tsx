import React from 'react';
import { Smartphone, Banknote, Receipt, Building2, CreditCard, Wallet } from 'lucide-react';
import { PaymentMode } from '../types';

interface PaymentModeBadgeProps {
  mode: PaymentMode;
  size?: 'sm' | 'md' | 'lg';
}

const PaymentModeBadge: React.FC<PaymentModeBadgeProps> = ({ mode, size = 'md' }) => {
  const getPaymentModeConfig = (paymentMode: PaymentMode) => {
    const configs = {
      upi: {
        icon: Smartphone,
        label: 'UPI',
        gradient: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
      },
      cash: {
        icon: Banknote,
        label: 'Cash',
        gradient: 'from-green-500 to-emerald-500',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
        borderColor: 'border-green-500/30',
      },
      check: {
        icon: Receipt,
        label: 'Check',
        gradient: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400',
        borderColor: 'border-blue-500/30',
      },
      'bank-transfer': {
        icon: Building2,
        label: 'Bank Transfer',
        gradient: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
      },
      card: {
        icon: CreditCard,
        label: 'Card',
        gradient: 'from-orange-500 to-amber-500',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        borderColor: 'border-orange-500/30',
      },
      other: {
        icon: Wallet,
        label: 'Other',
        gradient: 'from-gray-500 to-slate-500',
        bgColor: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        borderColor: 'border-gray-500/30',
      },
    };

    return configs[paymentMode] || configs.other;
  };

  const config = getPaymentModeConfig(mode);
  const Icon = config.icon;

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1 text-xs gap-1',
      icon: 12,
    },
    md: {
      container: 'px-3 py-1.5 text-sm gap-2',
      icon: 16,
    },
    lg: {
      container: 'px-4 py-2 text-base gap-2',
      icon: 20,
    },
  };

  const sizeClass = sizeClasses[size];

  return (
    <div
      className={`inline-flex items-center ${sizeClass.container} rounded-full font-semibold ${config.bgColor} ${config.textColor} border ${config.borderColor}`}
    >
      <Icon size={sizeClass.icon} />
      <span>{config.label}</span>
    </div>
  );
};

export default PaymentModeBadge;
