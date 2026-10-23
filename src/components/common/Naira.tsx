/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * Universal vector Nigerian Naira (₦) symbol component
 * Ensures crisp rendering across all OS/browser fonts without tofu / unrendered glyph boxes.
 */
export const Naira: React.FC<{ className?: string; size?: number | string }> = ({
  className = 'inline-block mr-0.5 align-middle',
  size = '0.85em',
}) => {
  return (
    <span
      className={`inline-flex items-center justify-center align-baseline font-bold ${className}`}
      aria-label="NGN"
      title="Nigerian Naira (₦)"
    >
      <svg
        style={{ width: size, height: size }}
        viewBox="0 0 24 24"
        fill="currentColor"
        className="inline-block shrink-0"
      >
        {/* Left vertical stem */}
        <rect x="3.5" y="3" width="3" height="18" rx="0.5" />
        {/* Right vertical stem */}
        <rect x="17.5" y="3" width="3" height="18" rx="0.5" />
        {/* Diagonal stroke */}
        <polygon points="5,3 8.5,3 19,21 15.5,21" />
        {/* Upper horizontal crossbar */}
        <rect x="1.5" y="8.5" width="21" height="2" rx="0.5" />
        {/* Lower horizontal crossbar */}
        <rect x="1.5" y="13.5" width="21" height="2" rx="0.5" />
      </svg>
    </span>
  );
};

export function formatNaira(amount: number): string {
  return `₦${amount.toLocaleString()}`;
}

