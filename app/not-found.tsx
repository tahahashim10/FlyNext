export default function NotFoundPage() {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-5xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg mb-4">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <a href="/" className="btn btn-primary">
          Go Home
        </a>
      </div>
    );
  }
  