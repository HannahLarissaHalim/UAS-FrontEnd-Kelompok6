import ErrorPage from './components/ErrorPage';

export default function NotFound() {
  return (
    <ErrorPage
      errorCode="404"
      errorMessage="Page Not Found"
      errorDetails="The page you are looking for does not exist or has been moved."
    />
  );
}
