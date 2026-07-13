import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-700">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-display text-xl font-bold text-primary-foreground mb-4">✦ FADE CUT</h3>
            <p className="font-body text-sm text-gray-400 leading-relaxed">
              Precision cuts. Quiet luxury.<br />
              The art of the modern barbershop.
            </p>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-4">Navigation</h4>
            <ul className="space-y-3">
              {['Home', 'Services', 'Book Now', 'Login'].map((item) => (
                <li key={item}>
                  <Link
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    className="font-body text-sm text-gray-400 hover:text-primary-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 mb-4">Visit Us</h4>
            <address className="font-body text-sm text-gray-400 not-italic leading-relaxed">
              123 Main Street<br />
              Brooklyn, NY 11201<br /><br />
              Mon–Fri: 9AM – 7PM<br />
              Sat: 9AM – 5PM<br />
              Sun: Closed
            </address>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-mono text-[11px] text-gray-500">
            © {new Date().getFullYear()} FADE CUT. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-gray-300 transition-colors" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
