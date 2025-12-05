

const RAW_API_URL = import.meta.env.VITE_PUBLIC_API_URL || "";
const API_URL = RAW_API_URL.replace(/\/+$/, "");

// Prevent double slashes in URLs
function buildUrl(endpoint) {
  return `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`.replace(/\/+/g, '/');
}

export async function fetchPricingPlans() {
  const url = 'https://backend.wutet.com/api/central/plans';
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) throw new Error('Failed to load pricing plans');
  const json = await res.json();
  return json?.data ?? [];
}

export async function registerTenant(payload) {
  const url ='https://backend.wutet.com/api/central/tenants';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.data?.message || 'Failed to register tenant');
  }

  return res.json();
}

// ONLY ONE VERSION — CLEAN & FINAL
export async function waitForTenantDeployment(tenantDomain, onProgress) {
  const maxAttempts = 120;   // 120 × 5s = 10 minutes max
  const interval = 5000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`https://backend.wutet.com/api/central/tenant-deployment-status/${tenantDomain}`, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const json = await res.json();
      const data = json.data || {};
      const status = data.status;
      const progress = data.progress || 0;

      // Send raw status as message — you already display it nicely in UI
      onProgress({
        message: status || 'Working...',
        progress: Math.min(progress, 98),
        rawStatus: status,
      });

      // Final success states
      if (['deployed', 'completed', 'ready', 'active'].includes(status?.toLowerCase())) {
        onProgress({ message: 'All done! Redirecting...', progress: 100 });
        return {
          success: true,
          frontendUrl: data.frontendUrl || `https://${tenantDomain}.wutet.com/login`,
        };
      }

      // Explicit failure
      if (status === 'failed' || data.error) {
        throw new Error(data.error || 'Deployment failed');
      }

    } catch (err) {
      console.error('Polling error:', err);
      onProgress({
        message: 'Waiting for server...',
        progress: Math.min((attempt / maxAttempts) * 90, 90),
        error: err.message,
      });

      if (attempt === maxAttempts) {
        throw new Error('Deployment timed out after 10 minutes');
      }
    }

    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}