import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <div className="text-8xl font-black text-amber-400 mb-4">404</div>
        <h1 className="text-3xl font-bold mb-3">Page Not Found</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Looks like this page checked out! Let's get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold">
              🏠 Go Home
            </Button>
          </Link>
          <Link href="/hotels">
            <Button variant="outline">🏨 Browse Hotels</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
