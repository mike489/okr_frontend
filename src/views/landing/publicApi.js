

const API_URL = import.meta.env.VITE_PUBLIC_API_URL || "";


// Prevent double slashes in URLs

export async function fetchPricingPlans() {
  const url = `${API_URL}/plans`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });

  if (!res.ok) throw new Error('Failed to load pricing plans');
  const json = await res.json();
  return json?.data ?? [];
}
export async function registerTenant(payload) {
  const url = `${API_URL}/tenants`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Throw the full backend response
    throw json;
  }

  return json;
}


// ONLY ONE VERSION — CLEAN & FINAL
export async function waitForTenantDeployment(tenantDomain, onProgress) {
  const maxAttempts = 120; // 10 minutes max
  const interval = 5000;

  // Map backend status strings to friendly messages
  const deploymentStatusMap = {
    database_created: 'Setting up your database...',
    database_migrating: 'Preparing your database structure...',
    database_migrated: 'Database setup complete!',
    database_seeding: 'Populating your database with initial data...',
    database_seeded: 'Data added successfully!',
    domain_created: 'Configuring your domain...',
    deployed: 'Your workspace is ready!',
  };

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(
        `${API_URL}/tenant-deployment-status/${tenantDomain}`,
        { headers: { Accept: 'application/json' } }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = json.data || {};
      const statusKey = data.status; // e.g., 'database_created'
      const error = data.error;

      // Map backend status to message only
      const message = deploymentStatusMap[statusKey] || 'Processing...';

      onProgress({
        message,
        rawStatus: statusKey,
        error,
      });

      // Success check
      if (statusKey === 'deployed') {
        onProgress({ message: 'All done! Redirecting...' });
        return {
          success: true,
          frontendUrl: data.frontendUrl || `https://${tenantDomain}.wutet.com/login`,
        };
      }

      // Handle failure
      if (error || statusKey === 'failed') {
        throw new Error(error || 'Deployment failed');
      }

    } catch (err) {
      console.error('Polling error:', err);
      onProgress({
        message: 'Waiting for server...',
        error: err.message,
      });

      if (attempt === maxAttempts) {
        throw new Error('Deployment timed out after 10 minutes');
      }
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}
