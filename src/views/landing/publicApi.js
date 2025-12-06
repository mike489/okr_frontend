

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
  const maxAttempts = 120; // 10 minutes max
  const interval = 5000;

 const deploymentStepsMap = {
  1: { message: 'Setting up your database...', progress: 10 },
  2: { message: 'Preparing your database structure...', progress: 25 },
  3: { message: 'Database setup complete!', progress: 40 },
  4: { message: 'Populating your database with initial data...', progress: 55 },
  5: { message: 'Data added successfully!', progress: 70 },
  6: { message: 'Configuring your domain...', progress: 85 },
  7: { message: 'Your domain is ready to use!', progress: 100 },
};


  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(
        `https://backend.wutet.com/api/central/tenant-deployment-status/${tenantDomain}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = json.data || {};

      // numeric step (if your backend returns it)
      const step = data.step || 0;
      const error = data.error;

      // map step to message & progress
      const mapped = deploymentStepsMap[step] || { message: 'Processing...', progress: Math.min((attempt / maxAttempts) * 90, 90) };

      onProgress({
        message: mapped.message,
        progress: mapped.progress,
        rawStatus: data.status,
        step,
        error,
      });

      // success check: step 7 = deployed
      if (step === 7) {
        onProgress({ message: 'All done! Redirecting...', progress: 100 });
        return {
          success: true,
          frontendUrl: data.frontendUrl || `https://${tenantDomain}.wutet.com/login`,
        };
      }

      // handle explicit failure
      if (error || data.status === 'failed') {
        throw new Error(error || 'Deployment failed');
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

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
