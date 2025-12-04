'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import '../custom.css';

export default function ErrorPage({ 
  errorCode = '404', 
  errorMessage = 'Page Not Found',
  errorDetails = 'The page you are looking for does not exist.'
}) {
  const router = useRouter();

  return (
    <div className="error-page-container">
      <div className="error-content">
        <div className="error-logo-section">
          <Image
            src="/images/logo.png"
            alt="FTEAT Logo"
            width={150}
            height={150}
            unoptimized
          />
          <h1 className="error-brand">FTEAT</h1>
        </div>

        <div className="error-details-section">
          <h2 className="error-code">{errorCode}</h2>
          <h3 className="error-message">{errorMessage}</h3>
          <p className="error-description">{errorDetails}</p>

          <button 
            className="error-back-btn"
            onClick={() => router.push('/home')}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
