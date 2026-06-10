import { Link } from 'react-router-dom'
import { FiGithub, FiTwitter, FiInstagram, FiFacebook, FiMail } from 'react-icons/fi'

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-dark-card text-gray-300 mt-16">
      {/* Newsletter */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-500">
        <div className="container-fluid py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-1">Subscribe to our Newsletter</h3>
              <p className="text-primary-100">Get the latest deals and products delivered to your inbox.</p>
            </div>
            <form className="flex gap-3 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email..."
                className="flex-1 md:w-72 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button type="submit"
                className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-fluid py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl">
                E
              </div>
              <span className="font-bold text-xl text-white">ECommerce</span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
              Your one-stop destination for quality products at amazing prices. Shop with confidence.
            </p>
            <div className="flex items-center gap-3">
              {[FiGithub, FiTwitter, FiInstagram, FiFacebook].map((Icon, i) => (
                <a key={i} href="#" className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-primary-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            {
              title: 'Shop',
              links: [
                { to: '/products', label: 'All Products' },
                { to: '/products?isFeatured=true', label: 'Featured' },
                { to: '/products?sortBy=sales', label: 'Best Sellers' },
                { to: '/products?sortBy=createdAt', label: 'New Arrivals' },
              ],
            },
            {
              title: 'Account',
              links: [
                { to: '/profile', label: 'My Profile' },
                { to: '/orders', label: 'My Orders' },
                { to: '/wishlist', label: 'Wishlist' },
                { to: '/dashboard', label: 'Dashboard' },
              ],
            },
            {
              title: 'Help',
              links: [
                { to: '#', label: 'Contact Us' },
                { to: '#', label: 'FAQs' },
                { to: '#', label: 'Shipping Info' },
                { to: '#', label: 'Returns Policy' },
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="font-semibold text-white mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to}
                      className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-fluid py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} ECommerce Store. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
