'use client';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ProtectedRoute = ({
  match,
  children,
}: {
  match: boolean;
  children: ReactNode;
}) => {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  useEffect(() => {
    if (!match) {
      router.push('/unauthorized'); // Redirigir a una página de acceso no autorizado si match es falso
    } else {
      setIsAllowed(true);
    }
  }, [match, router]);

  return <>{isAllowed ? children : null}</>;
};

export default ProtectedRoute;
