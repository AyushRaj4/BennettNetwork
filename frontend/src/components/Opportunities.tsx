import {
  Briefcase,
  GraduationCap,
  FlaskConical,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

const Opportunities = () => {
  const opportunities = [
    {
      icon: Briefcase,
      type: "Internship",
      title: "Software Development Intern",
      company: "Tech Mahindra",
      location: "Noida, India",
      duration: "3-6 months",
      stipend: "₹15,000 - ₹25,000/month",
      skills: ["React", "Node.js", "MongoDB"],
      posted: "2 days ago",
      applicants: 45,
      color: "bg-blue-50 border-blue-200",
    },
    {
      icon: GraduationCap,
      type: "Full-Time",
      title: "Graduate Engineer Trainee",
      company: "Infosys",
      location: "Bangalore, India",
      duration: "Permanent",
      stipend: "₹6.5 LPA",
      skills: ["Java", "Python", "SQL"],
      posted: "1 week ago",
      applicants: 234,
      color: "bg-green-50 border-green-200",
    },
    {
      icon: FlaskConical,
      type: "Research",
      title: "Research Assistant - AI/ML",
      company: "Bennett University",
      location: "Greater Noida, India",
      duration: "1 year",
      stipend: "₹20,000/month",
      skills: ["Machine Learning", "Python", "TensorFlow"],
      posted: "3 days ago",
      applicants: 67,
      color: "bg-purple-50 border-purple-200",
    },
    {
      icon: Briefcase,
      type: "Full-Time",
      title: "Product Manager",
      company: "Flipkart",
      location: "Bangalore, India",
      duration: "Permanent",
      stipend: "₹12-15 LPA",
      skills: ["Product Strategy", "Analytics", "SQL"],
      posted: "5 days ago",
      applicants: 189,
      color: "bg-orange-50 border-orange-200",
    },
    {
      icon: Briefcase,
      type: "Internship",
      title: "Data Science Intern",
      company: "Amazon",
      location: "Hyderabad, India",
      duration: "6 months",
      stipend: "₹50,000/month",
      skills: ["Python", "R", "Statistics"],
      posted: "1 day ago",
      applicants: 312,
      color: "bg-yellow-50 border-yellow-200",
    },
    {
      icon: GraduationCap,
      type: "Full-Time",
      title: "Frontend Developer",
      company: "Paytm",
      location: "Noida, India",
      duration: "Permanent",
      stipend: "₹8-10 LPA",
      skills: ["React", "TypeScript", "CSS"],
      posted: "4 days ago",
      applicants: 156,
      color: "bg-indigo-50 border-indigo-200",
    },
  ];

  const stats = [
    {
      label: "Active Opportunities",
      value: "1,200+",
      icon: Briefcase,
      color: "text-blue-600",
    },
    {
      label: "Companies Hiring",
      value: "350+",
      icon: GraduationCap,
      color: "text-green-600",
    },
    {
      label: "Avg. Salary Offered",
      value: "₹8.5 LPA",
      icon: DollarSign,
      color: "text-purple-600",
    },
    {
      label: "Students Placed",
      value: "850+",
      icon: Clock,
      color: "text-orange-600",
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore Opportunities
          </h2>
          <p className="text-xl text-gray-600">
            Internships, jobs, and research positions curated for Bennett
            students
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow"
            >
              <stat.icon className={`h-8 w-8 ${stat.color} mx-auto mb-2`} />
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Opportunities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp, index) => (
            <div
              key={index}
              className={`${opp.color} border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <opp.icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 bg-white px-3 py-1 rounded-full">
                    {opp.type}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#0066cc] transition-colors">
                {opp.title}
              </h3>
              <p className="text-md font-semibold text-gray-700 mb-4">
                {opp.company}
              </p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  {opp.location}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {opp.duration}
                </div>
                <div className="flex items-center text-sm font-semibold text-gray-900">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {opp.stipend}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {opp.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="bg-white text-xs font-medium text-gray-700 px-3 py-1 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-300">
                <div className="text-xs text-gray-500">
                  {opp.applicants} applicants • {opp.posted}
                </div>
                <button className="bg-[#0066cc] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0052a3] transition-colors flex items-center group/btn">
                  Apply
                  <ArrowRight className="ml-1 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-[#0066cc] hover:bg-[#0052a3] text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors inline-flex items-center group">
            View All Opportunities
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Opportunities;
