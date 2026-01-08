import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ThumbsUp,
  Award,
  Sparkles,
} from "lucide-react";

const Feed = () => {
  const posts = [
    {
      author: {
        name: "Dr. Rajesh Kumar",
        role: "Professor, Computer Science",
        avatar: "https://randomuser.me/api/portraits/men/32.jpg",
        time: "2h ago",
      },
      content:
        'Excited to announce that our research paper on "AI-Driven Healthcare Solutions" has been accepted at the International Conference on Machine Learning! Proud of my research team 🎉',
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
      likes: 234,
      comments: 45,
      shares: 12,
    },
    {
      author: {
        name: "Ananya Verma",
        role: "Final Year, CSE",
        avatar: "https://randomuser.me/api/portraits/women/44.jpg",
        time: "5h ago",
      },
      content:
        "Just received my offer letter from Microsoft! Dreams do come true with hard work and determination. Thank you Bennett University for the amazing support! 💙",
      badge: "Placement",
      likes: 589,
      comments: 98,
      shares: 34,
    },
    {
      author: {
        name: "Karan Mehta",
        role: "Alumni, Class of 2020",
        avatar: "https://randomuser.me/api/portraits/men/67.jpg",
        time: "1d ago",
      },
      content:
        "Looking to hire 3 Full Stack Developers at my startup. Preference for Bennett alumni. Great opportunity for freshers! DM for details.",
      badge: "Opportunity",
      likes: 156,
      comments: 67,
      shares: 89,
    },
  ];

  const trending = [
    { tag: "PlacementSeason", posts: 234 },
    { tag: "ResearchPapers", posts: 156 },
    { tag: "TechFest2025", posts: 445 },
    { tag: "AlumniMeet", posts: 189 },
    { tag: "StartupStories", posts: 276 },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What's Happening at Bennett
          </h2>
          <p className="text-xl text-gray-600">
            Stay updated with the latest news, achievements, and opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6"
              >
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full border-2 border-[#0066cc]"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {post.author.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {post.author.role}
                      </p>
                      <p className="text-xs text-gray-400">
                        {post.author.time}
                      </p>
                    </div>
                  </div>
                  {post.badge && (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        post.badge === "Placement"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {post.badge}
                    </span>
                  )}
                </div>

                {/* Post Content */}
                <p className="text-gray-800 mb-4 leading-relaxed">
                  {post.content}
                </p>

                {/* Post Image */}
                {post.image && (
                  <img
                    src={post.image}
                    alt="Post"
                    className="w-full rounded-lg mb-4 object-cover max-h-96"
                  />
                )}

                {/* Post Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group">
                    <ThumbsUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{post.likes}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group">
                    <MessageCircle className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{post.comments}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group">
                    <Share2 className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{post.shares}</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors group">
                    <Bookmark className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <h3 className="font-bold text-gray-900">Trending Topics</h3>
              </div>
              <div className="space-y-3">
                {trending.map((topic, index) => (
                  <div
                    key={index}
                    className="hover:bg-gray-50 p-2 rounded-lg cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-[#0066cc]">#{topic.tag}</p>
                    <p className="text-xs text-gray-500">{topic.posts} posts</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
              <Award className="h-8 w-8 mb-4" />
              <h3 className="font-bold text-xl mb-2">Placement Season 2025</h3>
              <div className="space-y-2 text-sm">
                <p>• 850+ students placed</p>
                <p>• Highest Package: ₹45 LPA</p>
                <p>• Average Package: ₹8.5 LPA</p>
                <p>• 200+ Companies visited</p>
              </div>
              <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors w-full">
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Feed;
