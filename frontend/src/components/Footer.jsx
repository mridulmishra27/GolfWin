import { FiTwitter, FiInstagram, FiLinkedin, FiMail } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const links = {
    platform: [
      { name: 'How it Works', href: '#how-it-works' },
      { name: 'Weekly Draws', href: '#' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Winners Circle', href: '#' },
    ],
    charities: [
      { name: 'Our Partners', href: '#charities' },
      { name: 'Suggest a Charity', href: '#' },
      { name: 'Impact Reports', href: '#' },
      { name: 'Transparency', href: '#' },
    ],
    legal: [
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Rules of Play', href: '#' },
      { name: 'Contact Us', href: '#' },
    ],
  };

  return (
    <footer className="bg-deep-900 pt-20 pb-10 border-t border-surface-border relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-deep-800 to-transparent pointer-events-none"></div>

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <a href="#" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-electric to-orchid flex items-center justify-center shadow-glow-cyan text-deep-900 font-bold text-xl">
                G
              </div>
              <span className="font-heading font-bold text-2xl tracking-tight text-white">
                Golf<span className="text-electric">Win</span>
              </span>
            </a>
            <p className="text-gray-400 mb-8 max-w-sm">
              The modern draw platform where every play contributes to global change. Pick your numbers, watch the draw, fund the future.
            </p>
            
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-electric hover:border-electric transition-colors">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-orchid hover:border-orchid transition-colors">
                <FiInstagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-gray-400 hover:text-amber hover:border-amber transition-colors">
                <FiLinkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-4">
              {links.platform.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-electric transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal & Help</h4>
            <ul className="space-y-4">
              {links.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            &copy; {currentYear} GolfWin. All rights reserved. Play responsibly.
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiMail className="text-gray-400" />
            <a href="mailto:hello@golfwin.com" className="hover:text-white transition-colors">
              hello@golfwin.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
