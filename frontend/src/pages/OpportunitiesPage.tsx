import { useState } from "react";
import {
  Search,
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Filter,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";

const OpportunitiesPage = () => {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "internship" | "fulltime" | "research"
  >("all");

  const opportunities = [
    {
      id: 1,
      type: "Internship",
      title: "Software Development Intern",
      company: "Tech Mahindra",
      logo: "https://logo.clearbit.com/techmahindra.com",
      location: "Noida, India",
      workMode: "Hybrid",
      duration: "3-6 months",
      stipend: "₹15,000 - ₹25,000/month",
      skills: ["React", "Node.js", "MongoDB"],
      posted: "2 days ago",
      applicants: 45,
      description:
        "Join our dynamic team to work on cutting-edge web applications. You will collaborate with senior developers and gain hands-on experience in full-stack development.",
      responsibilities: [
        "Develop and maintain web applications",
        "Collaborate with cross-functional teams",
        "Write clean, maintainable code",
      ],
    },
    {
      id: 2,
      type: "Full-Time",
      title: "Graduate Engineer Trainee",
      company: "Infosys",
      logo: "https://logo.clearbit.com/infosys.com",
      location: "Bangalore, India",
      workMode: "On-site",
      duration: "Permanent",
      stipend: "₹6.5 LPA",
      skills: ["Java", "Python", "SQL"],
      posted: "1 week ago",
      applicants: 234,
      description:
        "Kickstart your career with Infosys as a Graduate Engineer Trainee. Receive comprehensive training and work on enterprise-level projects.",
      responsibilities: [
        "Participate in training programs",
        "Work on client projects",
        "Develop technical skills",
      ],
    },
    {
      id: 3,
      type: "Research",
      title: "Research Assistant - AI/ML",
      company: "Bennett University",
      logo: "https://www.bennett.edu.in/wp-content/themes/bennett/images/bennett-university-logo.png",
      location: "Greater Noida, India",
      workMode: "On-site",
      duration: "1 year",
      stipend: "₹20,000/month",
      skills: ["Machine Learning", "Python", "TensorFlow"],
      posted: "3 days ago",
      applicants: 67,
      description:
        "Work on cutting-edge AI research projects under the guidance of experienced faculty. Opportunity to publish papers and attend conferences.",
      responsibilities: [
        "Conduct research experiments",
        "Analyze data",
        "Write research papers",
      ],
    },
    {
      id: 4,
      type: "Full-Time",
      title: "Product Manager",
      company: "Flipkart",
      logo: "https://logo.clearbit.com/flipkart.com",
      location: "Bangalore, India",
      workMode: "Hybrid",
      duration: "Permanent",
      stipend: "₹12-15 LPA",
      skills: ["Product Strategy", "Analytics", "SQL"],
      posted: "5 days ago",
      applicants: 189,
      description:
        "Lead product initiatives and drive growth for one of India's largest e-commerce platforms.",
      responsibilities: [
        "Define product roadmap",
        "Analyze user metrics",
        "Collaborate with engineering teams",
      ],
    },
    {
      id: 5,
      type: "Internship",
      title: "Data Science Intern",
      company: "Amazon",
      logo: "https://logo.clearbit.com/amazon.com",
      location: "Hyderabad, India",
      workMode: "On-site",
      duration: "6 months",
      stipend: "₹50,000/month",
      skills: ["Python", "R", "Statistics"],
      posted: "1 day ago",
      applicants: 312,
      description:
        "Work on real-world data science problems at Amazon. Gain experience in machine learning, data analysis, and big data technologies.",
      responsibilities: [
        "Build ML models",
        "Analyze large datasets",
        "Create data visualizations",
      ],
    },
  ];

  const filteredOpportunities =
    activeFilter === "all"
      ? opportunities
      : opportunities.filter((opp) => opp.type.toLowerCase() === activeFilter);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Opportunities
          </h1>
          <p className="text-lg text-gray-600">
            Explore internships, jobs, and research positions curated for
            Bennett students
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Applied</span>
                  <span className="font-bold text-[#0066cc]">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Saved</span>
                  <span className="font-bold text-gray-900">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Interviews</span>
                  <span className="font-bold text-green-600">3</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type
                  </label>
                  <div className="space-y-2">
                    {["All", "Internship", "Full-Time", "Research"].map(
                      (type) => (
                        <label key={type} className="flex items-center">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]"
                            defaultChecked={type === "All"}
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {type}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Work Mode
                  </label>
                  <div className="space-y-2">
                    {["On-site", "Remote", "Hybrid"].map((mode) => (
                      <label key={mode} className="flex items-center">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-[#0066cc] focus:ring-[#0066cc]"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          {mode}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc]">
                    <option>Any</option>
                    <option>₹0 - ₹3 LPA</option>
                    <option>₹3 - ₹6 LPA</option>
                    <option>₹6 - ₹10 LPA</option>
                    <option>₹10+ LPA</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Type Filter */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by title, company, or skills..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
                />
              </div>

              <div className="flex gap-3">
                {[
                  { key: "all", label: "All Opportunities" },
                  { key: "internship", label: "Internships" },
                  { key: "fulltime", label: "Full-Time" },
                  { key: "research", label: "Research" },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key as any)}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                      activeFilter === filter.key
                        ? "bg-[#0066cc] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Opportunities List */}
            <div className="space-y-6">
              {filteredOpportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {opp.logo ? (
                          <img
                            src={opp.logo}
                            alt={opp.company}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Building2 className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900 hover:text-[#0066cc] cursor-pointer">
                            {opp.title}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              opp.type === "Internship"
                                ? "bg-blue-100 text-blue-700"
                                : opp.type === "Full-Time"
                                ? "bg-green-100 text-green-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {opp.type}
                          </span>
                        </div>
                        <p className="text-lg font-semibold text-gray-700 mb-2">
                          {opp.company}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {opp.location} • {opp.workMode}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {opp.duration}
                          </div>
                          <div className="flex items-center gap-1 font-semibold text-gray-900">
                            <DollarSign className="h-4 w-4" />
                            {opp.stipend}
                          </div>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-[#0066cc] transition-colors">
                      <BookmarkPlus className="h-6 w-6" />
                    </button>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {opp.description}
                  </p>

                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">
                      Required Skills:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {opp.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-1 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      {opp.applicants} applicants • Posted {opp.posted}
                    </div>
                    <div className="flex gap-2">
                      <button className="px-6 py-2 border border-[#0066cc] text-[#0066cc] rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <ExternalLink className="h-4 w-4" />
                        View Details
                      </button>
                      <button className="px-6 py-2 bg-[#0066cc] text-white rounded-lg font-semibold hover:bg-[#0052a3] transition-colors flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Apply Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesPage;
