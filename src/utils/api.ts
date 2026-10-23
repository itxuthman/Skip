/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// API client for communication with backend Express server

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return res.json();
}
