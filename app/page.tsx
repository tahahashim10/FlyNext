import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center space-y-8">
      <h1 className="text-5xl font-bold">Welcome to FlyNext!</h1>
      <p className="text-lg">
        Your most reliable travel companion. Book flights and hotels with ease!
      </p>
      <div className="space-x-4">
        <Link href="/login">
          <button className="btn btn-primary">Login</button>
        </Link>
        <Link href="/signup">
          <button className="btn btn-secondary">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}
