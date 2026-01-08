import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Users,
  Building2,
  Calendar,
  ExternalLink,
  ArrowLeft,
  Loader,
  Award,
  X,
} from "lucide-react";
import {
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiPython,
  SiCplusplus,
  SiMongodb,
  SiPostgresql,
  SiMysql,
  SiDocker,
  SiKubernetes,
  SiAmazon,
  SiGooglecloud,
  SiGit,
  SiGithub,
  SiHtml5,
  SiCss3,
  SiTailwindcss,
  SiExpress,
  SiDjango,
  SiFlask,
  SiSpringboot,
  SiRedis,
  SiGraphql,
  SiNextdotjs,
  SiVuedotjs,
  SiAngular,
} from "react-icons/si";
import { userService, postService, networkService } from "../services/api";
import type { UserProfile } from "../services/api";

const UserProfilePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    followers: 0,
  });

  useEffect(() => {
    if (userId) {
      loadUserProfile();
    }
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError("");

      if (!userId) {
        setError("User ID is required");
        return;
      }

      const userProfile = await userService.getProfileById(userId);
      setProfile(userProfile);

      // Fetch stats
      await fetchUserStats(userId);
    } catch (err: any) {
      console.error("Error loading user profile:", err);
      setError(err.response?.data?.message || "Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async (uid: string) => {
    try {
      // Fetch user's posts count
      const userPosts = await postService.getUserPosts(uid);

      // Fetch user's connections count
      const connections = await networkService.getConnections();
      const userConnections = connections.filter(
        (conn: any) => conn.userId === uid || conn.connectedUserId === uid
      );

      setStats({
        connections: userConnections.length,
        posts: userPosts.length,
        followers: 0,
      });
    } catch (err) {
      console.error("Error fetching user stats:", err);
    }
  };

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    if (skillLower.includes("javascript") || skillLower === "js")
      return SiJavascript;
    if (skillLower.includes("typescript") || skillLower === "ts")
      return SiTypescript;
    if (skillLower.includes("react")) return SiReact;
    if (skillLower.includes("node")) return SiNodedotjs;
    if (skillLower.includes("python")) return SiPython;
    if (skillLower.includes("c++") || skillLower === "cpp") return SiCplusplus;
    if (skillLower.includes("mongo")) return SiMongodb;
    if (skillLower.includes("postgres")) return SiPostgresql;
    if (skillLower.includes("mysql")) return SiMysql;
    if (skillLower.includes("docker")) return SiDocker;
    if (skillLower.includes("kubernetes")) return SiKubernetes;
    if (skillLower.includes("aws")) return SiAmazon;
    if (skillLower.includes("gcp") || skillLower.includes("google cloud"))
      return SiGooglecloud;
    if (skillLower.includes("git")) return SiGit;
    if (skillLower.includes("github")) return SiGithub;
    if (skillLower.includes("html")) return SiHtml5;
    if (skillLower.includes("css")) return SiCss3;
    if (skillLower.includes("tailwind")) return SiTailwindcss;
    if (skillLower.includes("express")) return SiExpress;
    if (skillLower.includes("django")) return SiDjango;
    if (skillLower.includes("flask")) return SiFlask;
    if (skillLower.includes("spring")) return SiSpringboot;
    if (skillLower.includes("redis")) return SiRedis;
    if (skillLower.includes("graphql")) return SiGraphql;
    if (skillLower.includes("next")) return SiNextdotjs;
    if (skillLower.includes("vue")) return SiVuedotjs;
    if (skillLower.includes("angular")) return SiAngular;
    return null;
  };

  const getRoleDisplay = (role: string) => {
    const roleMap: {
      [key: string]: { label: string; icon: any; color: string };
    } = {
      student: {
        label: "Student",
        icon: GraduationCap,
        color: "text-blue-600",
      },
      professor: {
        label: "Professor",
        icon: Briefcase,
        color: "text-purple-600",
      },
      alumni: { label: "Alumni", icon: Award, color: "text-green-600" },
    };
    return roleMap[role] || roleMap.student;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[#0066cc]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Profile not found"}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-[#0066cc] hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const roleInfo = getRoleDisplay(profile.role);
  const RoleIcon = roleInfo.icon;
  const fullName =
    `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "User";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-[#0066cc] transition-colors font-medium"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6 relative">
          {/* Banner Image */}
          <div
            className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 relative cursor-pointer hover:opacity-95 transition-opacity"
            style={
              profile.banner
                ? {
                    backgroundImage: `url(${profile.banner})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                : undefined
            }
            onClick={() => profile.banner && setShowBannerModal(true)}
          />

          {/* Profile Content */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between">
              <div className="flex items-end space-x-5 -mt-16">
                <div className="relative">
                  <img
                    src={
                      profile.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        fullName
                      )}&background=0066cc&color=fff&size=200`
                    }
                    alt={fullName}
                    className="w-32 h-32 rounded-full border-4 border-white shadow-xl cursor-pointer hover:opacity-95 transition-opacity object-cover"
                    onClick={() => profile.avatar && setShowAvatarModal(true)}
                  />
                </div>
              </div>
            </div>

            {/* Name and Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {fullName}
              </h1>
              <div className="flex items-center space-x-2 mb-3">
                <RoleIcon className={`h-5 w-5 ${roleInfo.color}`} />
                <p className="text-lg text-gray-600">
                  {profile.title || roleInfo.label}
                </p>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                {profile.location?.city && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>
                      {profile.location.city}
                      {profile.location.state && `, ${profile.location.state}`}
                    </span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>{profile.email}</span>
                </div>
                {profile.contact?.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 shrink-0" />
                    <span>{profile.contact.phone}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span>Bennett University</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-8 pb-6 border-b border-gray-200">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-gray-900">
                    {stats.connections}
                  </span>
                </div>
                <p className="text-sm text-gray-600 font-medium">Connections</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 block mb-1">
                  {stats.posts}
                </span>
                <p className="text-sm text-gray-600 font-medium">Posts</p>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-900 block mb-1">
                  {stats.followers}
                </span>
                <p className="text-sm text-gray-600 font-medium">Followers</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          {profile.bio ? (
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="italic">This user has not updated their bio yet</p>
            </div>
          )}
        </div>

        {/* Skills & Expertise Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Skills & Expertise
          </h2>
          {profile.skills && profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => {
                const SkillIcon = getSkillIcon(skill);
                return (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    {SkillIcon && <SkillIcon className="h-4 w-4" />}
                    {skill}
                  </span>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="italic">This user has not added any skills yet</p>
            </div>
          )}
        </div>

        {/* Education Section - Only for Students */}
        {profile.role === "student" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
            </div>
            {profile.studentInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Roll Number</p>
                    <p className="font-semibold text-gray-900">
                      {profile.studentInfo.rollNumber || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">
                      {profile.studentInfo.department || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Batch</p>
                    <p className="font-semibold text-gray-900">
                      {profile.studentInfo.batch || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current Semester
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profile.studentInfo.semester
                        ? `Semester ${profile.studentInfo.semester}`
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CGPA</p>
                    <p className="font-semibold text-gray-900">
                      {profile.studentInfo.cgpa
                        ? `${profile.studentInfo.cgpa}/10`
                        : "Not provided"}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="italic">
                  This user has not updated their education information yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Professor Info Section - Only for Professors */}
        {profile.role === "professor" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Academic Information
              </h2>
            </div>
            {profile.professorInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.professorInfo.department && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Department</p>
                    <p className="font-semibold text-gray-900">
                      {profile.professorInfo.department}
                    </p>
                  </div>
                )}
                {profile.professorInfo.designation && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Designation</p>
                    <p className="font-semibold text-gray-900">
                      {profile.professorInfo.designation}
                    </p>
                  </div>
                )}
                {profile.professorInfo.specialization &&
                  profile.professorInfo.specialization.length > 0 && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-2">
                        Specialization
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {profile.professorInfo.specialization.map(
                          (spec, index) => (
                            <span
                              key={index}
                              className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm font-medium"
                            >
                              {spec}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="italic">
                  This user has not updated their academic information yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Alumni Info Section - Only for Alumni */}
        {profile.role === "alumni" && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Award className="h-6 w-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Alumni Information
              </h2>
            </div>
            {profile.alumniInfo ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.alumniInfo.graduationYear && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Graduation Year
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profile.alumniInfo.graduationYear}
                    </p>
                  </div>
                )}
                {profile.alumniInfo.degree && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Degree</p>
                    <p className="font-semibold text-gray-900">
                      {profile.alumniInfo.degree}
                    </p>
                  </div>
                )}
                {profile.alumniInfo.currentCompany && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current Company
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profile.alumniInfo.currentCompany}
                    </p>
                  </div>
                )}
                {profile.alumniInfo.currentPosition && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Current Position
                    </p>
                    <p className="font-semibold text-gray-900">
                      {profile.alumniInfo.currentPosition}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p className="italic">
                  This user has not updated their alumni information yet
                </p>
              </div>
            )}
          </div>
        )}

        {/* Experience Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Experience</h2>
          {profile.experience && profile.experience.length > 0 ? (
            <div className="space-y-6">
              {profile.experience.map((exp, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-4 pb-6 border-b border-gray-200 last:border-0 last:pb-0"
                >
                  <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {exp.title}
                    </h3>
                    <p className="text-gray-600 font-medium mb-2">
                      {exp.company}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(exp.startDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}{" "}
                          -{" "}
                          {exp.isCurrent
                            ? "Present"
                            : new Date(exp.endDate!).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                        </span>
                      </div>
                      {exp.employmentType && (
                        <>
                          <span>•</span>
                          <span>{exp.employmentType}</span>
                        </>
                      )}
                      {exp.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{exp.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="italic">
                This user has not added any experience yet
              </p>
            </div>
          )}
        </div>

        {/* Activity Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Activity</h2>
            <span className="text-sm font-medium text-blue-600">
              {stats.posts} posts
            </span>
          </div>
          <div className="text-center py-8 text-gray-500">
            <p className="italic">No activity yet</p>
          </div>
        </div>

        {/* Featured Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Featured</h2>
          {profile.featured && profile.featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.featured.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.date && (
                      <p className="text-xs text-gray-500 mb-2">
                        {new Date(item.date).toLocaleDateString()}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 inline-flex items-center"
                      >
                        View <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
              <Award className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="italic">
                This user has not added any featured items yet
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Banner Image Modal */}
      {showBannerModal && profile.banner && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowBannerModal(false)}
        >
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setShowBannerModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={profile.banner}
              alt="Cover"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Avatar Image Modal */}
      {showAvatarModal && profile.avatar && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={profile.avatar}
              alt={fullName}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfilePage;
