import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LiveRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/parvagues');
  }, [router]);
  
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl mb-4">Redirection...</h1>
        <p>Vous allez être redirigé vers la page principale de ParVagues.</p>
      </div>
    </div>
  );
} 