// components/AdminRoute.js
'use client';

import { useContext, useEffect } from 'react';
import { AuthContext } from '../path/to/your/authContext';
import { useRouter } from 'next/navigation';

const AdminRoute = (WrappedComponent) => {
  return (props) => {
    const { user, userRole, loading } = useContext(AuthContext);
    const router = useRouter();

    useEffect(() => {
      if (!loading && (!user || userRole !== 'admin')) {
        router.replace('/');
      }
    }, [user, userRole, loading, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!user || userRole !== 'admin') {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
};

export default AdminRoute;