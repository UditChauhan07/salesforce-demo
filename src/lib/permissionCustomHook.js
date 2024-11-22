import { useState, useEffect } from 'react';
import { getPermissions } from './permissions'; 
export function useUserPermissions() {
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPermissions() {
      try {
        setLoading(true);
        const perms = await getPermissions();
        setPermissions(perms);
      } catch (err) {
        console.error("Error fetching permissions", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPermissions();
  }, []); 

  return { permissions, loading, error };
}
