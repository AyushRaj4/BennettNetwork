import {
  Code,
  Briefcase,
  FlaskConical,
  Building2,
  LineChart,
  Users,
  GraduationCap,
  BookOpen,
  Lightbulb,
  Globe,
} from "lucide-react";

const departments = [
  {
    icon: Code,
    name: "Computer Science & Engineering",
    members: "3,500+",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Briefcase,
    name: "School of Management",
    members: "2,800+",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: FlaskConical,
    name: "Biotechnology",
    members: "1,200+",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: Building2,
    name: "Civil Engineering",
    members: "1,500+",
    color: "bg-orange-50 text-orange-600",
  },
  {
    icon: LineChart,
    name: "Economics & Finance",
    members: "1,800+",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Globe,
    name: "Liberal Arts",
    members: "1,100+",
    color: "bg-indigo-50 text-indigo-600",
  },
  {
    icon: Lightbulb,
    name: "Design & Innovation",
    members: "900+",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: BookOpen,
    name: "Law School",
    members: "1,600+",
    color: "bg-pink-50 text-pink-600",
  },
  {
    icon: Users,
    name: "Mass Communication",
    members: "1,400+",
    color: "bg-teal-50 text-teal-600",
  },
  {
    icon: GraduationCap,
    name: "Research & Development",
    members: "800+",
    color: "bg-cyan-50 text-cyan-600",
  },
];

const Categories = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explore by Department
          </h2>
          <p className="text-xl text-gray-600">
            Connect with students, professors, and alumni across various schools
            and departments
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {departments.map((dept, index) => (
            <div
              key={index}
              className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#0066cc] hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div
                  className={`${dept.color} p-4 rounded-full group-hover:scale-110 transition-transform duration-300`}
                >
                  <dept.icon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#0066cc] transition-colors text-sm">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {dept.members} members
                  </p>
                </div>
              </div>

              {/* Connection indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* User Type Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-blue-600 p-4 rounded-full">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Students</h3>
                <p className="text-sm text-gray-600">15,000+ active</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Build your network, explore opportunities, and connect with peers
              and seniors
            </p>
            <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
              Explore Students →
            </button>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-green-600 p-4 rounded-full">
                <Users className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Professors</h3>
                <p className="text-sm text-gray-600">500+ faculty</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Collaborate on research, mentor students, and share knowledge with
              the community
            </p>
            <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
              Explore Faculty →
            </button>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
            <div className="flex items-center space-x-4 mb-4">
              <div className="bg-purple-600 p-4 rounded-full">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Alumni</h3>
                <p className="text-sm text-gray-600">8,000+ graduates</p>
              </div>
            </div>
            <p className="text-gray-700 mb-4">
              Give back, hire talent, and stay connected with your alma mater
            </p>
            <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
              Explore Alumni →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
