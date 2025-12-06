import { useEffect, useState } from 'react';

const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let t = localStorage.getItem("current_tenant");

    if (!t) {
      const parts = window.location.hostname.split(".");
      if (parts.length >= 3) t = parts[0];
    }

    setTenant(t || null);
    setChecked(true);
  }, []);

  if (!checked) {
    return null; 
  }

  return typeof children === "function" ? children(tenant) : children;
};

export default TenantProvider;
