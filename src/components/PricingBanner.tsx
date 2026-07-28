"use client";
 
import { useState } from "react";
 
interface PricingBannerProps {
  humanizeCount: number;
}
 
// Replace with your PayPal payment links
const PAYPAL_MONTHLY = "https://www.paypal.com/ncp/payment/J9KJ6NLZYERUA";
const PAYPAL_YEARLY = "https://www.paypal.com/ncp/payment/K8T9T4NRTKCBY";
 
export function PricingBanner({ humanizeCount }: PricingBannerProps) {
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");
 
  const price = billing === "monthly" ? 9 : 7;
  const paypalLink = billing === "monthly" ? PAYPAL_MONTHLY : PAYPAL_YEARLY;
  const badge =
    humanizeCount <= 0
      ? "You've used all 5 free humanizations today"
      : humanizeCount <= 2
        ? `Only ${humanizeCount} free left today`
        : null;
 
  return (
    <div className="mt-8 glass-card text-center">
      {badge && (
        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-3">
          {badge}
        </p>
      )}
      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
        Unlimited Humanizations
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
        Priority speed, no rate limits, all tones.
      </p>
 
      <div className="inline-flex items-center gap-2 mt-4 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
        <button
          onClick={() => setBilling("monthly")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            billing === "monthly"
              ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            billing === "yearly"
              ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          Yearly
        </button>
      </div>
 
      <div className="mt-4">
        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
          ${price}
        </span>
        <span className="text-gray-500 dark:text-gray-400 text-sm">
          /month
        </span>
        {billing === "yearly" && (
          <span className="ml-2 inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold px-2 py-0.5 rounded-full">
            Save 22%
          </span>
        )}
      </div>
 
      <a
        href={paypalLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-block w-full sm:w-auto px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
      >
        Upgrade Now — ${billing === "monthly" ? "9/mo" : "7/mo"}
      </a>
 
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Secure payment via PayPal. Cancel anytime.
      </p>
    </div>
  );
}