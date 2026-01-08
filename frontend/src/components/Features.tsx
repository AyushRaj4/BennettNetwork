import {
  Users,
  Award,
  BookOpen,
  Rocket,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Users,
      title: "Build Your Network",
      description:
        "Connect with 23,500+ students, professors, and alumni from Bennett University.",
    },
    {
      icon: BookOpen,
      title: "Knowledge Sharing",
      description:
        "Access notes, projects, research papers, and resources shared by the community.",
    },
    {
      icon: Award,
      title: "Showcase Achievements",
      description:
        "Highlight your projects, awards, publications, and academic accomplishments.",
    },
    {
      icon: Rocket,
      title: "Career Growth",
      description:
        "Get referrals, mentorship, and exclusive job opportunities from alumni network.",
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description:
        "Monitor your academic journey, skills development, and placement preparation.",
    },
    {
      icon: MessageSquare,
      title: "Real-time Collaboration",
      description:
        "Collaborate on projects, research, and study groups with peers and faculty.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Why Join Bennett University Network?
          </h2>
          <p className="text-xl text-gray-600">
            Your one-stop platform for academic and professional growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-8 shadow-md hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#0066cc] transition-all">
                <feature.icon className="h-8 w-8 text-[#0066cc] group-hover:text-white transition-colors" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* University Stats Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-xl p-12">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Bennett University by the Numbers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">
                15,000+
              </div>
              <div className="text-gray-600 font-medium">Active Students</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">500+</div>
              <div className="text-gray-600 font-medium">Faculty Members</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">
                8,000+
              </div>
              <div className="text-gray-600 font-medium">Alumni Network</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">200+</div>
              <div className="text-gray-600 font-medium">Partner Companies</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">50+</div>
              <div className="text-gray-600 font-medium">Student Clubs</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">95%</div>
              <div className="text-gray-600 font-medium">Placement Rate</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">
                ₹8.5L
              </div>
              <div className="text-gray-600 font-medium">Avg. Package</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#0066cc] mb-2">100+</div>
              <div className="text-gray-600 font-medium">Research Papers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
