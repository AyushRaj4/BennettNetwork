import { useState } from "react";
import { Search, UserPlus, Mail, Filter, Users, Building2 } from "lucide-react";

const Network = () => {
  const [activeTab, setActiveTab] = useState<"connections" | "suggestions">(
    "suggestions"
  );

  const connections = [
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Final Year, CSE",
      department: "Computer Science",
      batch: "2021-2025",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      mutualConnections: 12,
      connected: true,
    },
    {
      id: 2,
      name: "Priya Kapoor",
      role: "Assistant Professor",
      department: "Biotechnology",
      batch: "Faculty",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      mutualConnections: 8,
      connected: true,
    },
    {
      id: 3,
      name: "Arjun Mehta",
      role: "Alumni, Software Engineer at Google",
      department: "Computer Science",
      batch: "Class of 2022",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      mutualConnections: 25,
      connected: true,
    },
  ];

  const suggestions = [
    {
      id: 4,
      name: "Ananya Verma",
      role: "Third Year, Management",
      department: "School of Management",
      batch: "2022-2026",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      mutualConnections: 5,
      connected: false,
    },
    {
      id: 5,
      name: "Dr. Rajesh Kumar",
      role: "Professor, AI & ML",
      department: "Computer Science",
      batch: "Faculty",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      mutualConnections: 15,
      connected: false,
    },
    {
      id: 6,
      name: "Sneha Patel",
      role: "Alumni, Product Manager at Flipkart",
      department: "MBA",
      batch: "Class of 2023",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg",
      mutualConnections: 18,
      connected: false,
    },
    {
      id: 7,
      name: "Karan Singh",
      role: "Second Year, Civil Engineering",
      department: "Civil Engineering",
      batch: "2023-2027",
      avatar: "https://randomuser.me/api/portraits/men/55.jpg",
      mutualConnections: 7,
      connected: false,
    },
    {
      id: 8,
      name: "Meera Nair",
      role: "Research Scholar",
      department: "Biotechnology",
      batch: "PhD Student",
      avatar: "https://randomuser.me/api/portraits/women/72.jpg",
      mutualConnections: 10,
      connected: false,
    },
  ];

  const displayData = activeTab === "connections" ? connections : suggestions;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Network</h1>
          <p className="text-lg text-gray-600">
            Grow and manage your professional network at Bennett University
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats Card */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-bold text-gray-900 mb-4">Network Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Connections</span>
                  <span className="font-bold text-[#0066cc]">342</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Following</span>
                  <span className="font-bold text-gray-900">89</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Profile Views</span>
                  <span className="font-bold text-gray-900">1,234</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Filters</h3>
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc]">
                    <option>All Departments</option>
                    <option>Computer Science</option>
                    <option>Management</option>
                    <option>Biotechnology</option>
                    <option>Civil Engineering</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc]">
                    <option>All Users</option>
                    <option>Students</option>
                    <option>Professors</option>
                    <option>Alumni</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc]">
                    <option>All Batches</option>
                    <option>2024-2028</option>
                    <option>2023-2027</option>
                    <option>2022-2026</option>
                    <option>2021-2025</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Tabs */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, department, or batch..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc] focus:ring-2 focus:ring-[#0066cc]/20"
                />
              </div>

              <div className="flex gap-4 border-b border-gray-200">
                <button
                  onClick={() => setActiveTab("suggestions")}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === "suggestions"
                      ? "text-[#0066cc]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Suggestions ({suggestions.length})
                  {activeTab === "suggestions" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("connections")}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === "connections"
                      ? "text-[#0066cc]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  My Connections ({connections.length})
                  {activeTab === "connections" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* People Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayData.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-16 h-16 rounded-full border-2 border-[#0066cc]"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {person.role}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                        <Building2 className="h-3 w-3" />
                        <span>{person.department}</span>
                        <span>•</span>
                        <span>{person.batch}</span>
                      </div>
                      {person.mutualConnections > 0 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                          <Users className="h-3 w-3" />
                          <span>
                            {person.mutualConnections} mutual connections
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {person.connected ? (
                          <>
                            <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                              <Mail className="h-4 w-4" />
                              Message
                            </button>
                            <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                              <Users className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <button className="flex-1 bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Connect
                          </button>
                        )}
                      </div>
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

export default Network;
