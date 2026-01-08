import {
  ArrowRight,
  Users,
  GraduationCap,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const Hero = () => {
  return (
    <section className="relative bg-linear-to-br from-blue-50 via-white to-indigo-50 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block bg-blue-100 text-[#0066cc] px-4 py-2 rounded-full text-sm font-semibold mb-4">
                Bennett University Network
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Connect, Collaborate, and Grow Together
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Join Bennett University's professional network connecting
                students, professors, and alumni for endless opportunities
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 py-6">
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-[#0066cc]" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      15,000+
                    </div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">500+</div>
                    <div className="text-sm text-gray-600">Professors</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Briefcase className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      8,000+
                    </div>
                    <div className="text-sm text-gray-600">Alumni</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      1,200+
                    </div>
                    <div className="text-sm text-gray-600">Opportunities</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center group shadow-lg">
                Join Network
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg border-2 border-gray-300 transition-colors flex items-center justify-center group">
                Explore Opportunities
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {/* <img
                src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=600&fit=crop"
                alt="Bennett University Students"
                className="w-full h-full object-cover"
              /> */}
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                  Shape Your Future
                </h3>
                <p className="text-sm opacity-90 drop-shadow-md">
                  Connect with peers, mentors, and industry leaders
                </p>
              </div>
            </div>

            {/* Animated Connecting Pipe with Flowing Signal */}
            <svg
              className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
              preserveAspectRatio="none"
            >
              {/* Main Pipe Path */}
              <defs>
                <linearGradient
                  id="pipeGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#0066cc", stopOpacity: 0.4 }}
                  />
                  <stop
                    offset="50%"
                    style={{ stopColor: "#0066cc", stopOpacity: 0.7 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#0066cc", stopOpacity: 0.4 }}
                  />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Curved Pipe - connecting top-right card to bottom-left card */}
              <path
                id="pipePath"
                d="M 480 90 Q 300 300 120 510"
                stroke="url(#pipeGradient)"
                strokeWidth="5"
                fill="none"
                strokeLinecap="round"
                className="opacity-70"
                vectorEffect="non-scaling-stroke"
              />

              {/* Flowing Signal Dots */}
              <circle r="8" fill="#0066cc" filter="url(#glow)">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  calcMode="linear"
                >
                  <mpath href="#pipePath" />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </circle>

              <circle r="8" fill="#00a8ff" filter="url(#glow)">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  begin="1s"
                  calcMode="linear"
                >
                  <mpath href="#pipePath" />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="3s"
                  repeatCount="indefinite"
                  begin="1s"
                />
              </circle>

              <circle r="8" fill="#66b3ff" filter="url(#glow)">
                <animateMotion
                  dur="3s"
                  repeatCount="indefinite"
                  begin="2s"
                  calcMode="linear"
                >
                  <mpath href="#pipePath" />
                </animateMotion>
                <animate
                  attributeName="opacity"
                  values="0;1;1;0"
                  dur="3s"
                  repeatCount="indefinite"
                  begin="2s"
                />
              </circle>
            </svg>

            {/* Floating Activity Cards */}
            <div className="absolute bottom-4 left-10 bg-white p-4 rounded-xl shadow-xl animate-float max-w-xs z-10">
              <div className="flex items-start space-x-3 mb-3">
                <img
                  src="https://randomuser.me/api/portraits/women/65.jpg"
                  alt="Student"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Priya Sharma
                  </p>
                  <p className="text-xs text-gray-600">
                    Just got placed at Google! 🎉
                  </p>
                  <p className="text-xs text-gray-400 mt-1">2 mins ago</p>
                </div>
              </div>
              {/* Post Image */}
              <img
                src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=200&fit=crop"
                alt="Google Office"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>

            {/* Third Card - Alumni Achievement */}
            <div
              className="absolute bottom-4 left-[400px] bg-white p-4 rounded-xl shadow-xl animate-float max-w-xs z-10"
              style={{ animationDelay: "0.5s" }}
            >
              <div className="flex items-start space-x-3 mb-3">
                <img
                  src="https://randomuser.me/api/portraits/men/32.jpg"
                  alt="Alumni"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">
                    Rahul Mehta
                  </p>
                  <p className="text-xs text-gray-600">
                    Alumni • Promoted to Tech Lead at Microsoft! 🚀
                  </p>
                  <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                </div>
              </div>
              {/* Post Image */}
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop"
                alt="Microsoft Office"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>

            <div
              className="absolute top-20 right-32 bg-white p-4 rounded-xl shadow-xl animate-float max-w-xs z-10"
              style={{ animationDelay: "1s" }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-[#0066cc]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    New Research
                  </p>
                  <p className="text-xs text-gray-600">Published today</p>
                </div>
              </div>
              {/* Research Image */}
              <img
                src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=200&fit=crop"
                alt="Research Paper"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 opacity-5">
        <svg width="600" height="600" viewBox="0 0 600 600">
          <circle cx="300" cy="300" r="300" fill="#0066cc" />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
