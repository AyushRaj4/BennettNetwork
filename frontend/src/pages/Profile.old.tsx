import {
  MapPin,
  Mail,
  Phone,
  Calendar,
  Award,
  Link as LinkIcon,
  Edit2,
  Heart,
  MessageCircle,
  Share2,
  Users,
} from "lucide-react";

const Profile = () => {
  const user = {
    name: "Ayush Raj",
    title: "Computer Science Student | Full Stack Developer",
    location: "Greater Noida, Uttar Pradesh",
    email: "ayush.raj@bennett.edu.in",
    phone: "+91 98765 43210",
    joinDate: "January 2023",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    banner:
      "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&h=300",
    bio: "Passionate about building scalable web applications and exploring new technologies. Currently learning React, Node.js, and cloud computing. Always eager to collaborate on innovative projects.",
    stats: {
      connections: 342,
      posts: 48,
      followers: 256,
    },
  };

  const skills = [
    "React.js",
    "TypeScript",
    "Node.js",
    "Express.js",
    "MongoDB",
    "Python",
    "Java",
    "C++",
    "Git",
    "Docker",
    "AWS",
    "Tailwind CSS",
  ];

  const experiences = [
    {
      id: 1,
      title: "Full Stack Developer Intern",
      company: "Tech Mahindra",
      location: "Noida, India",
      period: "May 2024 - Present",
      description:
        "Working on enterprise web applications using React and Node.js. Implemented RESTful APIs and optimized database queries.",
      logo: "https://logo.clearbit.com/techmahindra.com",
    },
    {
      id: 2,
      title: "Web Development Intern",
      company: "Freelance",
      location: "Remote",
      period: "Jan 2024 - Apr 2024",
      description:
        "Developed responsive websites for local businesses. Collaborated with clients to understand requirements and deliver solutions.",
      logo: "https://ui-avatars.com/api/?name=FL&background=0066cc&color=fff",
    },
  ];

  const education = [
    {
      id: 1,
      degree: "B.Tech in Computer Science",
      institution: "Bennett University",
      period: "2023 - 2027",
      grade: "CGPA: 8.7/10",
      logo: "https://www.bennett.edu.in/wp-content/themes/bennett/images/bennett-university-logo.png",
    },
    {
      id: 2,
      degree: "Senior Secondary (XII)",
      institution: "Delhi Public School",
      period: "2021 - 2023",
      grade: "Percentage: 92%",
      logo: "https://ui-avatars.com/api/?name=DPS&background=0066cc&color=fff",
    },
  ];

  const achievements = [
    {
      id: 1,
      title: "Smart India Hackathon Winner",
      issuer: "Government of India",
      date: "December 2024",
      icon: Award,
    },
    {
      id: 2,
      title: "AWS Cloud Practitioner Certified",
      issuer: "Amazon Web Services",
      date: "October 2024",
      icon: Award,
    },
    {
      id: 3,
      title: "Best Research Paper Award",
      issuer: "Bennett University",
      date: "August 2024",
      icon: Award,
    },
  ];

  const posts = [
    {
      id: 1,
      content:
        "Excited to share that our team won the Smart India Hackathon 2024! 🎉 Developed an AI-powered solution for smart city management. Grateful for the learning experience!",
      timestamp: "2 days ago",
      likes: 156,
      comments: 23,
      shares: 12,
      image:
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&h=400",
    },
    {
      id: 2,
      content:
        "Just deployed my first full-stack MERN application! 🚀 Check out the link in the comments. Any feedback would be appreciated!",
      timestamp: "1 week ago",
      likes: 89,
      comments: 15,
      shares: 7,
    },
    {
      id: 3,
      content:
        "Attended an amazing workshop on Cloud Computing by AWS at Bennett University. Key takeaways: serverless architecture, scalability patterns, and cost optimization strategies.",
      timestamp: "2 weeks ago",
      likes: 67,
      comments: 11,
      shares: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Banner and Profile Picture */}
      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-[#0066cc] to-[#0052a3]">
          <img
            src={user.banner}
            alt="Banner"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-24 pb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-40 h-40 rounded-full border-8 border-white shadow-xl"
              />
              <div className="flex-1">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 mb-1">
                        {user.name}
                      </h1>
                      <p className="text-lg text-gray-700 mb-3">{user.title}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {user.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {user.stats.connections} connections
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Joined {user.joinDate}
                        </div>
                      </div>
                    </div>
                    <button className="px-6 py-2.5 bg-[#0066cc] hover:bg-[#0052a3] text-white rounded-lg font-semibold transition-colors flex items-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-1 space-y-6">
            {/* About */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed mb-4">{user.bio}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Mail className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Phone className="h-4 w-4" />
                  {user.phone}
                </div>
                <div className="flex items-center gap-2 text-[#0066cc] hover:underline cursor-pointer">
                  <LinkIcon className="h-4 w-4" />
                  github.com/ayush-raj
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-blue-50 text-[#0066cc] rounded-lg text-sm font-semibold hover:bg-blue-100 transition-colors cursor-pointer"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Achievements
              </h2>
              <div className="space-y-4">
                {achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3">
                    <div className="bg-yellow-100 text-yellow-600 p-2 rounded-lg shrink-0">
                      <achievement.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {achievement.issuer}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {achievement.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Experience */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Experience</h2>
                <button className="text-[#0066cc] font-semibold hover:underline">
                  + Add
                </button>
              </div>
              <div className="space-y-6">
                {experiences.map((exp) => (
                  <div key={exp.id} className="flex gap-4">
                    <img
                      src={exp.logo}
                      alt={exp.company}
                      className="w-12 h-12 rounded-lg border border-gray-200 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          exp.company
                        )}&background=0066cc&color=fff`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{exp.title}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-600">
                        {exp.period} · {exp.location}
                      </p>
                      <p className="text-gray-700 mt-2">{exp.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Education</h2>
                <button className="text-[#0066cc] font-semibold hover:underline">
                  + Add
                </button>
              </div>
              <div className="space-y-6">
                {education.map((edu) => (
                  <div key={edu.id} className="flex gap-4">
                    <img
                      src={edu.logo}
                      alt={edu.institution}
                      className="w-12 h-12 rounded-lg border border-gray-200 shrink-0"
                      onError={(e) => {
                        e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          edu.institution
                        )}&background=0066cc&color=fff`;
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-sm text-gray-600">{edu.period}</p>
                      <p className="text-sm font-semibold text-gray-700 mt-1">
                        {edu.grade}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity / Posts */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Activity</h2>
              <div className="space-y-6">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
                  >
                    <p className="text-gray-800 leading-relaxed mb-3">
                      {post.content}
                    </p>
                    {post.image && (
                      <img
                        src={post.image}
                        alt="Post"
                        className="w-full h-64 object-cover rounded-lg mb-3"
                      />
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-600">
                        <button className="flex items-center gap-1 hover:text-[#0066cc] transition-colors">
                          <Heart className="h-4 w-4" />
                          {post.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-[#0066cc] transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          {post.comments}
                        </button>
                        <button className="flex items-center gap-1 hover:text-[#0066cc] transition-colors">
                          <Share2 className="h-4 w-4" />
                          {post.shares}
                        </button>
                      </div>
                      <span className="text-gray-500">{post.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
