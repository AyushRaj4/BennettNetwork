import {
  Facebook,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const footerSections = {
    "For Students": [
      "Find Opportunities",
      "Connect with Alumni",
      "Join Study Groups",
      "Access Resources",
      "Placement Preparation",
      "Skill Development",
    ],
    "For Professors": [
      "Research Collaboration",
      "Publish Papers",
      "Mentor Students",
      "Share Resources",
      "Academic Network",
    ],
    "For Alumni": [
      "Give Back",
      "Hire Talent",
      "Mentor Students",
      "Alumni Events",
      "Stay Connected",
    ],
    Resources: [
      "Help & Support",
      "Privacy Policy",
      "Terms of Service",
      "Guidelines",
      "FAQs",
      "Contact Us",
    ],
    "About Bennett": [
      "About University",
      "Campus Life",
      "Admissions",
      "Departments",
      "Research",
      "News & Events",
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Call to Action Banner */}
      <div className="bg-gradient-to-r from-[#0066cc] to-[#0052a3] py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                Join the Bennett University Network Today
              </h2>
              <p className="text-blue-100 text-lg">
                Connect with 23,500+ students, professors, and alumni
              </p>
            </div>
            <button className="bg-white text-[#0066cc] hover:bg-blue-50 px-8 py-4 rounded-lg font-semibold text-lg transition-colors shrink-0 shadow-lg">
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Bennett University Info */}
        <div className="mb-12 pb-8 border-b border-gray-800">
          <h3 className="text-2xl font-bold mb-4">
            Bennett University Network
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-400">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 mt-1 shrink-0" />
              <div>
                <p className="font-medium">Campus Address</p>
                <p className="text-sm">
                  Plot No 8-11, Tech Zone II, Greater Noida, Uttar Pradesh
                  201310
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 mt-1 shrink-0" />
              <div>
                <p className="font-medium">Contact</p>
                <p className="text-sm">+91-120-7155800</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 mt-1 shrink-0" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm">info@bennett.edu.in</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {Object.entries(footerSections).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-bold text-lg mb-4">{title}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social Media & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-8 border-b border-gray-800">
          <div>
            <h3 className="font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#0066cc] p-3 rounded-full transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#0066cc] p-3 rounded-full transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#0066cc] p-3 rounded-full transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#0066cc] p-3 rounded-full transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="bg-gray-800 hover:bg-[#0066cc] p-3 rounded-full transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4">Newsletter</h3>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-[#0066cc] text-white"
              />
              <button className="bg-[#0066cc] hover:bg-[#0052a3] px-6 py-2 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2025 Bennett University. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
