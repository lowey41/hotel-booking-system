import Link from 'next/link';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const FOOTER_LINKS = {
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Blog', href: '/blog' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Safety Info', href: '/safety' },
    { label: 'Cancellation', href: '/cancellation' },
    { label: 'Contact Us', href: '/contact' },
  ],
  Hosting: [
    { label: 'List Your Hotel', href: '/auth/register?role=HOTEL_OWNER' },
    { label: 'Owner Resources', href: '/owner' },
    { label: 'Community Forum', href: '/forum' },
    { label: 'Responsible Hosting', href: '/responsible-hosting' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-card border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold block mb-4">
              🏨 Stay<span className="text-amber-500">Wise</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-xs">
              Discover and book extraordinary hotels worldwide. AI-powered recommendations, seamless booking, unforgettable stays.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                <span>support@staywise.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-500" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span>San Francisco, CA 94102</span>
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-amber-500 transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © 2026 StayWise, Inc. All rights reserved.
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-amber-500">Privacy</Link>
            <Link href="/terms" className="hover:text-amber-500">Terms</Link>
            <Link href="/sitemap" className="hover:text-amber-500">Sitemap</Link>
          </div>

          <div className="flex items-center gap-3">
            {[
              { icon: Facebook, href: 'https://facebook.com' },
              { icon: Twitter, href: 'https://twitter.com' },
              { icon: Instagram, href: 'https://instagram.com' },
              { icon: Youtube, href: 'https://youtube.com' },
            ].map(({ icon: Icon, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border flex items-center justify-center text-muted-foreground hover:text-amber-500 hover:border-amber-500 transition-colors"
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
