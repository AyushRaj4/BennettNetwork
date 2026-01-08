import { useState, useEffect, useRef } from "react";
import {
  MapPin,
  Mail,
  Phone,
  Edit2,
  Save,
  X,
  Camera,
  Award,
  Briefcase,
  GraduationCap,
  Users,
  Building2,
  Calendar,
  Plus,
  ExternalLink,
  Trash2,
  AlertTriangle,
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
import { useAuth } from "../context/AuthContext";
import {
  userService,
  networkService,
  postService,
  authService,
} from "../services/api";
import type { UserProfile } from "../services/api";
import ConfirmModal from "../components/ConfirmModal";

const Profile = () => {
  const { user, profile: contextProfile, refreshProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showFeaturedModal, setShowFeaturedModal] = useState(false);
  const [editingExperienceIndex, setEditingExperienceIndex] = useState<
    number | null
  >(null);
  const [editingFeaturedIndex, setEditingFeaturedIndex] = useState<
    number | null
  >(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteExperienceIndex, setDeleteExperienceIndex] = useState<
    number | null
  >(null);
  const [deleteFeaturedIndex, setDeleteFeaturedIndex] = useState<number | null>(
    null
  );
  const [showDeleteExperienceConfirm, setShowDeleteExperienceConfirm] =
    useState(false);
  const [showDeleteFeaturedConfirm, setShowDeleteFeaturedConfirm] =
    useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Dynamic stats state
  const [stats, setStats] = useState({
    connections: 0,
    posts: 0,
    followers: 0,
  });

  // Editable form state
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [skillsInput, setSkillsInput] = useState("");

  // Experience form state
  const [experienceForm, setExperienceForm] = useState({
    title: "",
    company: "",
    employmentType: "",
    location: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    description: "",
  });

  // Featured form state
  const [featuredForm, setFeaturedForm] = useState({
    type: "post" as "post" | "article" | "project" | "certification",
    title: "",
    description: "",
    imageUrl: "",
    link: "",
    date: "",
  });

  useEffect(() => {
    if (contextProfile) {
      setProfile(contextProfile);
      setEditData(contextProfile);
      setLoading(false);
    } else {
      loadProfile();
    }
  }, [contextProfile]);

  // Fetch stats when profile is loaded
  useEffect(() => {
    if (profile?.userId) {
      fetchDynamicStats();
    }
  }, [profile?.userId]);

  const fetchDynamicStats = async () => {
    try {
      if (!profile?.userId) return;

      // Fetch connections count
      const connections = await networkService.getConnections();

      // Fetch user's posts count
      const userPosts = await postService.getUserPosts(profile.userId);

      setStats({
        connections: connections.length,
        posts: userPosts.length,
        followers: 0, // Followers feature not implemented yet
      });
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const profile = await userService.getMyProfile();
      setProfile(profile);
      setEditData(profile);
      setIsCreating(false);
    } catch (err: any) {
      // If profile doesn't exist (404), show creation form
      if (err.response?.status === 404) {
        setIsCreating(true);
        // Initialize form with user data from auth
        if (user) {
          const nameParts = user.fullName.split(" ");
          setEditData({
            firstName: nameParts[0],
            lastName: nameParts.slice(1).join(" ") || "",
            email: user.email,
            role: user.role,
          });
        }
      } else {
        setError(err.message || "Failed to load profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError("");
    // Set skills input as comma-separated string
    setSkillsInput(profile?.skills?.join(", ") || "");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(profile || {});
    setSkillsInput("");
    setError("");
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      if (!profile) {
        // Creating new profile
        const newProfile = await userService.createProfile({
          ...editData,
          userId: user?.id,
        });
        setProfile(newProfile);
        setIsCreating(false);
      } else {
        // Updating existing profile
        const updatedProfile = await userService.updateProfile(editData);
        setProfile(updatedProfile);
      }

      await refreshProfile();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditData((prev) => ({ ...prev, [field]: value }));
  };

  const updateNestedField = (parent: string, field: string, value: any) => {
    setEditData((prev) => ({
      ...prev,
      [parent]: {
        ...((prev as any)[parent] || {}),
        [field]: value,
      },
    }));
  };

  const updateSkills = (value: string) => {
    // Update the input field
    setSkillsInput(value);
    // Split by comma and filter out empty strings
    const skillsArray = value
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s);
    setEditData((prev) => ({
      ...prev,
      skills: skillsArray,
    }));
  };

  const handleImageUpload = (
    type: "avatar" | "banner",
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB original)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Please upload an image file");
        return;
      }

      setError(""); // Clear any previous errors

      // Create an image element to resize
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Set max dimensions
          const maxWidth = type === "avatar" ? 400 : 1200;
          const maxHeight = type === "avatar" ? 400 : 400;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to base64 with compression (0.7 quality for JPEG)
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);

          // Check final size (base64 string length)
          if (compressedBase64.length > 1.5 * 1024 * 1024) {
            // ~1.5MB after base64 encoding
            setError(
              "Image is still too large after compression. Please use a smaller image."
            );
            return;
          }

          updateField(type, compressedBase64);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Experience handlers
  const handleAddExperience = () => {
    setExperienceForm({
      title: "",
      company: "",
      employmentType: "",
      location: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      description: "",
    });
    setEditingExperienceIndex(null);
    setShowExperienceModal(true);
  };

  const handleEditExperience = (index: number) => {
    const exp = profile?.experience?.[index];
    if (exp) {
      setExperienceForm({
        title: exp.title || "",
        company: exp.company || "",
        employmentType: exp.employmentType || "",
        location: exp.location || "",
        startDate: exp.startDate
          ? new Date(exp.startDate).toISOString().split("T")[0]
          : "",
        endDate: exp.endDate
          ? new Date(exp.endDate).toISOString().split("T")[0]
          : "",
        isCurrent: exp.isCurrent || false,
        description: exp.description || "",
      });
      setEditingExperienceIndex(index);
      setShowExperienceModal(true);
    }
  };

  const handleSaveExperience = async () => {
    if (
      !experienceForm.title ||
      !experienceForm.company ||
      !experienceForm.startDate
    ) {
      setError(
        "Please fill in all required fields (Title, Company, Start Date)"
      );
      return;
    }

    const newExperience = {
      ...experienceForm,
      startDate: new Date(experienceForm.startDate).toISOString(),
      endDate: experienceForm.endDate
        ? new Date(experienceForm.endDate).toISOString()
        : undefined,
    };

    const updatedExperience = [...(profile?.experience || [])];

    if (editingExperienceIndex !== null) {
      updatedExperience[editingExperienceIndex] = newExperience;
    } else {
      updatedExperience.push(newExperience);
    }

    try {
      setSaving(true);
      const updatedProfile = await userService.updateProfile({
        experience: updatedExperience,
      });
      setProfile(updatedProfile);
      await refreshProfile();
      setShowExperienceModal(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to save experience");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async () => {
    if (deleteExperienceIndex === null) return;

    const updatedExperience =
      profile?.experience?.filter((_, i) => i !== deleteExperienceIndex) || [];

    try {
      setSaving(true);
      const updatedProfile = await userService.updateProfile({
        experience: updatedExperience,
      });
      setProfile(updatedProfile);
      await refreshProfile();
      setError("");
      setDeleteExperienceIndex(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete experience");
    } finally {
      setSaving(false);
    }
  };

  // Featured handlers
  const handleAddFeatured = () => {
    setFeaturedForm({
      type: "post",
      title: "",
      description: "",
      imageUrl: "",
      link: "",
      date: new Date().toISOString().split("T")[0],
    });
    setEditingFeaturedIndex(null);
    setShowFeaturedModal(true);
  };

  const handleEditFeatured = (index: number) => {
    const item = profile?.featured?.[index];
    if (item) {
      setFeaturedForm({
        type: item.type || "post",
        title: item.title || "",
        description: item.description || "",
        imageUrl: item.imageUrl || "",
        link: item.link || "",
        date: item.date ? new Date(item.date).toISOString().split("T")[0] : "",
      });
      setEditingFeaturedIndex(index);
      setShowFeaturedModal(true);
    }
  };

  const handleSaveFeatured = async () => {
    if (!featuredForm.title) {
      setError("Please enter a title");
      return;
    }

    const newFeatured = {
      ...featuredForm,
      date: featuredForm.date
        ? new Date(featuredForm.date).toISOString()
        : undefined,
    };

    const updatedFeatured = [...(profile?.featured || [])];

    if (editingFeaturedIndex !== null) {
      updatedFeatured[editingFeaturedIndex] = newFeatured;
    } else {
      updatedFeatured.push(newFeatured);
    }

    try {
      setSaving(true);
      const updatedProfile = await userService.updateProfile({
        featured: updatedFeatured,
      });
      setProfile(updatedProfile);
      await refreshProfile();
      setShowFeaturedModal(false);
      setError("");
    } catch (err: any) {
      setError(err.message || "Failed to save featured item");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFeatured = async () => {
    if (deleteFeaturedIndex === null) return;

    const updatedFeatured =
      profile?.featured?.filter((_, i) => i !== deleteFeaturedIndex) || [];

    try {
      setSaving(true);
      const updatedProfile = await userService.updateProfile({
        featured: updatedFeatured,
      });
      setProfile(updatedProfile);
      await refreshProfile();
      setError("");
      setDeleteFeaturedIndex(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete featured item");
    } finally {
      setSaving(false);
    }
  };

  // Delete account handler
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setError("");

      await authService.deleteAccount();

      // Logout and redirect after successful deletion
      authService.logout();
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to delete account. Please try again."
      );
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
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
    return (
      roleMap[role] || { label: role, icon: Users, color: "text-gray-600" }
    );
  };

  const getSkillIcon = (skill: string) => {
    const skillLower = skill.toLowerCase();
    const iconMap: { [key: string]: any } = {
      javascript: SiJavascript,
      js: SiJavascript,
      typescript: SiTypescript,
      ts: SiTypescript,
      react: SiReact,
      reactjs: SiReact,
      "react.js": SiReact,
      node: SiNodedotjs,
      nodejs: SiNodedotjs,
      "node.js": SiNodedotjs,
      python: SiPython,
      "c++": SiCplusplus,
      cpp: SiCplusplus,
      mongodb: SiMongodb,
      mongo: SiMongodb,
      postgresql: SiPostgresql,
      postgres: SiPostgresql,
      mysql: SiMysql,
      docker: SiDocker,
      kubernetes: SiKubernetes,
      k8s: SiKubernetes,
      aws: SiAmazon,
      "google cloud": SiGooglecloud,
      gcp: SiGooglecloud,
      git: SiGit,
      github: SiGithub,
      html: SiHtml5,
      html5: SiHtml5,
      css: SiCss3,
      css3: SiCss3,
      tailwind: SiTailwindcss,
      tailwindcss: SiTailwindcss,
      express: SiExpress,
      expressjs: SiExpress,
      "express.js": SiExpress,
      django: SiDjango,
      flask: SiFlask,
      spring: SiSpringboot,
      springboot: SiSpringboot,
      redis: SiRedis,
      graphql: SiGraphql,
      next: SiNextdotjs,
      nextjs: SiNextdotjs,
      "next.js": SiNextdotjs,
      vue: SiVuedotjs,
      vuejs: SiVuedotjs,
      "vue.js": SiVuedotjs,
      angular: SiAngular,
    };
    return iconMap[skillLower] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show profile creation form if no profile exists
  if (!profile && isCreating) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Create Your Profile
              </h1>
              <p className="text-gray-600 mt-2">
                Welcome! Let's set up your profile to get started.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <form className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Basic Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={editData.firstName || ""}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={editData.lastName || ""}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title / Headline
                  </label>
                  <input
                    type="text"
                    value={editData.title || ""}
                    onChange={(e) => updateField("title", e.target.value)}
                    placeholder="e.g., Computer Science Student | Full Stack Developer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editData.bio || ""}
                    onChange={(e) => updateField("bio", e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editData.location?.city || ""}
                      onChange={(e) =>
                        updateNestedField("location", "city", e.target.value)
                      }
                      placeholder="e.g., Greater Noida"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editData.contact?.phone || ""}
                      onChange={(e) =>
                        updateNestedField("contact", "phone", e.target.value)
                      }
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Add your skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editData.skills?.join(", ") || ""}
                    onChange={(e) => updateSkills(e.target.value)}
                    placeholder="e.g., React, Node.js, Python, MongoDB"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role-specific fields */}
              {editData.role === "student" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Student Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Roll Number
                      </label>
                      <input
                        type="text"
                        value={editData.studentInfo?.rollNumber || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "studentInfo",
                            "rollNumber",
                            e.target.value
                          )
                        }
                        placeholder="e.g., E23CSEU0277"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editData.studentInfo?.department || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "studentInfo",
                            "department",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Computer Science"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Batch
                      </label>
                      <input
                        type="text"
                        value={editData.studentInfo?.batch || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "studentInfo",
                            "batch",
                            e.target.value
                          )
                        }
                        placeholder="e.g., 2023-2027"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Semester
                      </label>
                      <input
                        type="number"
                        value={editData.studentInfo?.semester || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "studentInfo",
                            "semester",
                            parseInt(e.target.value)
                          )
                        }
                        placeholder="e.g., 3"
                        min="1"
                        max="8"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CGPA
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editData.studentInfo?.cgpa || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "studentInfo",
                            "cgpa",
                            parseFloat(e.target.value)
                          )
                        }
                        placeholder="e.g., 8.5"
                        min="0"
                        max="10"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editData.role === "professor" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Professional Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        value={editData.professorInfo?.employeeId || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "professorInfo",
                            "employeeId",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editData.professorInfo?.department || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "professorInfo",
                            "department",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Designation
                      </label>
                      <input
                        type="text"
                        value={editData.professorInfo?.designation || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "professorInfo",
                            "designation",
                            e.target.value
                          )
                        }
                        placeholder="e.g., Associate Professor"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Specialization (comma-separated)
                      </label>
                      <input
                        type="text"
                        value={
                          editData.professorInfo?.specialization?.join(", ") ||
                          ""
                        }
                        onChange={(e) =>
                          updateNestedField(
                            "professorInfo",
                            "specialization",
                            e.target.value.split(",").map((s) => s.trim())
                          )
                        }
                        placeholder="e.g., AI, Machine Learning"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {editData.role === "alumni" && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Alumni Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Graduation Year
                      </label>
                      <input
                        type="number"
                        value={editData.alumniInfo?.graduationYear || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "alumniInfo",
                            "graduationYear",
                            parseInt(e.target.value)
                          )
                        }
                        placeholder="e.g., 2023"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Department
                      </label>
                      <input
                        type="text"
                        value={editData.alumniInfo?.department || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "alumniInfo",
                            "department",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Company
                      </label>
                      <input
                        type="text"
                        value={editData.alumniInfo?.currentCompany || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "alumniInfo",
                            "currentCompany",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Position
                      </label>
                      <input
                        type="text"
                        value={editData.alumniInfo?.currentPosition || ""}
                        onChange={(e) =>
                          updateNestedField(
                            "alumniInfo",
                            "currentPosition",
                            e.target.value
                          )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  {saving ? "Creating Profile..." : "Create Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If profile is still null at this point, something went wrong
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-700">Unable to load profile</p>
          <button
            onClick={loadProfile}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Profile exists - show it
  const fullName = `${profile.firstName} ${profile.lastName}`.trim();
  const roleInfo = getRoleDisplay(profile.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Profile Card */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mt-8">
          {/* Banner */}
          <div
            className="relative h-52 bg-linear-to-br from-blue-600 via-indigo-600 to-purple-600 group"
            onMouseEnter={() => setIsBannerHovered(true)}
            onMouseLeave={() => setIsBannerHovered(false)}
          >
            {(isEditing ? editData.banner : profile.banner) && (
              <img
                src={isEditing ? editData.banner : profile.banner}
                alt="Banner"
                className="w-full h-full object-cover"
              />
            )}

            {/* Hover Overlay with Buttons */}
            {isBannerHovered && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-4 transition-all duration-200">
                {(isEditing ? editData.banner : profile.banner) && (
                  <button
                    onClick={() => setShowBannerModal(true)}
                    className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-all shadow-lg"
                  >
                    <Camera className="h-5 w-5" />
                    <span>View Cover Image</span>
                  </button>
                )}
                {isEditing && (
                  <>
                    <input
                      type="file"
                      ref={bannerInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload("banner", e)}
                      className="hidden"
                    />
                    <button
                      onClick={() => bannerInputRef.current?.click()}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg"
                    >
                      <Camera className="h-5 w-5" />
                      <span>Change Cover Image</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile Info Section */}
          <div className="relative px-6 sm:px-8 pb-6">
            {/* Avatar */}
            <div className="relative -mt-20 mb-4">
              <div
                className="relative inline-block group"
                onMouseEnter={() => setIsAvatarHovered(true)}
                onMouseLeave={() => setIsAvatarHovered(false)}
              >
                <img
                  src={
                    (isEditing ? editData.avatar : profile.avatar) ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      fullName
                    )}&background=0066cc&color=fff&size=160`
                  }
                  alt={fullName}
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover cursor-pointer"
                  onClick={() => setShowAvatarModal(true)}
                />

                {/* Hover Overlay */}
                {isAvatarHovered && (
                  <div
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200"
                    onClick={() => setShowAvatarModal(true)}
                  >
                    <span className="text-white text-sm font-medium">
                      {isEditing ? "Edit" : "View"}
                    </span>
                  </div>
                )}

                {/* Hidden file input for editing */}
                {isEditing && (
                  <input
                    type="file"
                    ref={avatarInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageUpload("avatar", e)}
                    className="hidden"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute -top-20 right-6 z-10">
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-white border-2 border-blue-600 text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-all shadow-lg"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full font-medium hover:bg-gray-50 transition-all disabled:opacity-50 shadow-lg"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all disabled:bg-blue-400 shadow-lg"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save"}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Name and Title */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {fullName}
              </h1>

              {/* Role Badge */}
              <div className="flex items-center space-x-2 mb-3">
                <div
                  className={`flex items-center space-x-1.5 px-3 py-1 bg-gray-100 rounded-full ${roleInfo.color}`}
                >
                  <RoleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">{roleInfo.label}</span>
                </div>
              </div>

              {/* Title/Headline */}
              {isEditing ? (
                <input
                  type="text"
                  value={editData.title || ""}
                  onChange={(e) => updateField("title", e.target.value)}
                  placeholder="Add a professional headline (e.g., Computer Science Student | Full Stack Developer)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
              ) : (
                <p className="text-xl text-gray-600">
                  {profile.title || "Add a professional headline"}
                </p>
              )}
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-center space-x-2 text-gray-600">
                <Building2 className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium">Bennett University</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="h-5 w-5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.location?.city || ""}
                    onChange={(e) =>
                      updateNestedField("location", "city", e.target.value)
                    }
                    placeholder="Add city"
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm">
                    {profile.location?.city || "Add location"}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="h-5 w-5 text-gray-400" />
                <a
                  href={`mailto:${profile.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {profile.email}
                </a>
              </div>

              {(profile.contact?.phone || isEditing) && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="h-5 w-5 text-gray-400" />
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editData.contact?.phone || ""}
                      onChange={(e) =>
                        updateNestedField("contact", "phone", e.target.value)
                      }
                      placeholder="Add phone"
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm">{profile.contact?.phone}</span>
                  )}
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center space-x-6 mb-6 pb-6 border-b border-gray-200">
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
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
          {isEditing ? (
            <textarea
              value={editData.bio || ""}
              onChange={(e) => updateField("bio", e.target.value)}
              placeholder="Write something about yourself... Share your story, goals, and what makes you unique."
              rows={6}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          ) : (
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {profile.bio || "Add a bio to tell others about yourself"}
            </p>
          )}
        </div>

        {/* Skills Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Skills & Expertise
            </h2>
            <Award className="h-5 w-5 text-blue-600" />
          </div>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => updateSkills(e.target.value)}
                placeholder="Add skills separated by commas (e.g., React, Node.js, Python, Machine Learning)"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">
                Separate skills with commas
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill, index) => {
                  const SkillIcon = getSkillIcon(skill);
                  return (
                    <span
                      key={index}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      {SkillIcon && <SkillIcon className="h-4 w-4" />}
                      <span>{skill}</span>
                    </span>
                  );
                })
              ) : (
                <p className="text-gray-500 italic">
                  Add your skills to showcase your expertise
                </p>
              )}
            </div>
          )}
        </div>

        {/* Role-Specific Info */}
        {profile.role === "student" && (
          <div className="bg-white rounded-xl shadow-md p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Education</h2>
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      value={editData.studentInfo?.rollNumber || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "studentInfo",
                          "rollNumber",
                          e.target.value
                        )
                      }
                      placeholder="e.g., E23CSEU0277"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={editData.studentInfo?.department || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "studentInfo",
                          "department",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Computer Science and Engineering"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Batch
                    </label>
                    <input
                      type="text"
                      value={editData.studentInfo?.batch || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "studentInfo",
                          "batch",
                          e.target.value
                        )
                      }
                      placeholder="e.g., 2023-2027"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Semester
                    </label>
                    <input
                      type="number"
                      value={editData.studentInfo?.semester || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "studentInfo",
                          "semester",
                          parseInt(e.target.value)
                        )
                      }
                      placeholder="e.g., 3"
                      min="1"
                      max="8"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CGPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editData.studentInfo?.cgpa || ""}
                      onChange={(e) =>
                        updateNestedField(
                          "studentInfo",
                          "cgpa",
                          parseFloat(e.target.value)
                        )
                      }
                      placeholder="e.g., 8.5"
                      min="0"
                      max="10"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Roll Number
                      </p>
                      <p className="text-base text-gray-900 font-semibold mt-1">
                        {profile.studentInfo?.rollNumber || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Department
                      </p>
                      <p className="text-base text-gray-900 font-semibold mt-1">
                        {profile.studentInfo?.department || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">Batch</p>
                      <p className="text-base text-gray-900 font-semibold mt-1">
                        {profile.studentInfo?.batch || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">
                        Current Semester
                      </p>
                      <p className="text-base text-gray-900 font-semibold mt-1">
                        {profile.studentInfo?.semester
                          ? `Semester ${profile.studentInfo.semester}`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <Award className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 font-medium">CGPA</p>
                      <p className="text-base text-gray-900 font-semibold mt-1">
                        {profile.studentInfo?.cgpa
                          ? `${profile.studentInfo.cgpa}/10`
                          : "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {profile.role === "professor" && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Professional Info
              </h2>
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <input
                    type="text"
                    value={editData.professorInfo?.employeeId || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "professorInfo",
                        "employeeId",
                        e.target.value
                      )
                    }
                    placeholder="Employee ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editData.professorInfo?.department || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "professorInfo",
                        "department",
                        e.target.value
                      )
                    }
                    placeholder="Department"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editData.professorInfo?.designation || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "professorInfo",
                        "designation",
                        e.target.value
                      )
                    }
                    placeholder="Designation (e.g., Associate Professor)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={
                      editData.professorInfo?.specialization?.join(", ") || ""
                    }
                    onChange={(e) =>
                      updateNestedField(
                        "professorInfo",
                        "specialization",
                        e.target.value.split(",").map((s) => s.trim())
                      )
                    }
                    placeholder="Specialization (comma-separated)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Employee ID:</span>{" "}
                    {profile.professorInfo?.employeeId || "Add employee ID"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Department:</span>{" "}
                    {profile.professorInfo?.department || "Add department"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Designation:</span>{" "}
                    {profile.professorInfo?.designation || "Add designation"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Specialization:</span>{" "}
                    {profile.professorInfo?.specialization?.join(", ") ||
                      "Add specialization"}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {profile.role === "alumni" && (
          <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Career</h2>
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <input
                    type="number"
                    value={editData.alumniInfo?.graduationYear || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "alumniInfo",
                        "graduationYear",
                        parseInt(e.target.value)
                      )
                    }
                    placeholder="Graduation Year"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editData.alumniInfo?.department || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "alumniInfo",
                        "department",
                        e.target.value
                      )
                    }
                    placeholder="Department"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editData.alumniInfo?.currentCompany || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "alumniInfo",
                        "currentCompany",
                        e.target.value
                      )
                    }
                    placeholder="Current Company"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={editData.alumniInfo?.currentPosition || ""}
                    onChange={(e) =>
                      updateNestedField(
                        "alumniInfo",
                        "currentPosition",
                        e.target.value
                      )
                    }
                    placeholder="Current Position"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </>
              ) : (
                <>
                  <p className="text-gray-700">
                    <span className="font-medium">Graduated:</span>{" "}
                    {profile.alumniInfo?.graduationYear ||
                      "Add graduation year"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Department:</span>{" "}
                    {profile.alumniInfo?.department || "Add department"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Current Company:</span>{" "}
                    {profile.alumniInfo?.currentCompany ||
                      "Add current company"}
                  </p>
                  <p className="text-gray-700">
                    <span className="font-medium">Position:</span>{" "}
                    {profile.alumniInfo?.currentPosition ||
                      "Add current position"}
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Experience Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Experience</h2>
            <button
              onClick={handleAddExperience}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add experience</span>
            </button>
          </div>
          {profile.experience && profile.experience.length > 0 ? (
            <div className="space-y-4">
              {profile.experience.map((exp, index) => (
                <div
                  key={exp.id || index}
                  className="flex gap-4 pb-4 border-b last:border-b-0 group"
                >
                  <div className="shrink-0">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Briefcase className="h-6 w-6 text-gray-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {exp.title}
                        </h3>
                        <p className="text-gray-700">{exp.company}</p>
                      </div>
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditExperience(index)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteExperienceIndex(index);
                            setShowDeleteExperienceConfirm(true);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      {exp.employmentType && `${exp.employmentType} • `}
                      {new Date(exp.startDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                      {" - "}
                      {exp.isCurrent
                        ? "Present"
                        : exp.endDate
                        ? new Date(exp.endDate).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })
                        : "Present"}
                    </p>
                    {exp.location && (
                      <p className="text-sm text-gray-500">{exp.location}</p>
                    )}
                    {exp.description && (
                      <p className="text-sm text-gray-700 mt-2">
                        {exp.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Briefcase className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="italic">
                Showcase your accomplishments and get up to 2X as many profile
                views
              </p>
              <button
                onClick={handleAddExperience}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="inline h-4 w-4 mr-1" />
                Add experience
              </button>
            </div>
          )}
        </div>

        {/* Activity Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Activity</h2>
            <span className="text-sm text-blue-600 font-medium">
              {profile.stats?.posts || 0} posts
            </span>
          </div>
          {profile.activities && profile.activities.length > 0 ? (
            <div className="space-y-4">
              {profile.activities.slice(0, 3).map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="pb-4 border-b last:border-b-0"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-sm text-gray-600">
                      {new Date(activity.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {activity.title}
                      </h4>
                      {activity.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {activity.imageUrl && (
                    <img
                      src={activity.imageUrl}
                      alt={activity.title}
                      className="w-full rounded-lg mt-2"
                    />
                  )}
                  <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                    {activity.likes !== undefined && (
                      <span>{activity.likes} likes</span>
                    )}
                    {activity.comments !== undefined && (
                      <span>{activity.comments} comments</span>
                    )}
                    {activity.shares !== undefined && (
                      <span>{activity.shares} shares</span>
                    )}
                  </div>
                </div>
              ))}
              {profile.activities.length > 3 && (
                <button className="w-full py-2 text-center text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                  Show all activity →
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p className="italic">No activity yet</p>
            </div>
          )}
        </div>

        {/* Featured Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Featured</h2>
            <button
              onClick={handleAddFeatured}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add featured</span>
            </button>
          </div>
          {profile.featured && profile.featured.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.featured.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow group relative"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <h4 className="font-semibold text-gray-900 flex-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditFeatured(index)}
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-gray-600" />
                        </button>
                        <button
                          onClick={() => {
                            setDeleteFeaturedIndex(index);
                            setShowDeleteFeaturedConfirm(true);
                          }}
                          className="p-1.5 hover:bg-red-50 rounded-full transition-colors"
                          title="Delete"
                        >
                          <X className="h-3.5 w-3.5 text-red-600" />
                        </button>
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    {item.link && (
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-flex items-center"
                        onClick={(e) => e.stopPropagation()}
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
                Showcase posts, articles, projects, and certifications
              </p>
              <button
                onClick={handleAddFeatured}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="inline h-4 w-4 mr-1" />
                Add to featured
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mt-6 border-2 border-red-200">
          <div className="flex items-center space-x-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <h2 className="text-xl font-bold text-red-600">Danger Zone</h2>
          </div>
          <div className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data. This
                  action cannot be undone. All your posts, connections, likes,
                  and comments will be permanently removed.
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="ml-4 flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500">
                  This action is permanent
                </p>
              </div>
            </div>

            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
              <p className="text-sm text-gray-700 leading-relaxed">
                Are you absolutely sure? This action{" "}
                <strong>cannot be undone</strong>. All your data will be
                permanently deleted:
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>All posts and media</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>All connections and network data</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>All likes, comments, and interactions</span>
                </li>
                <li className="flex items-center">
                  <span className="mr-2">•</span>
                  <span>Your profile and account information</span>
                </li>
              </ul>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isDeleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Image Modal */}
      {showBannerModal && (
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
              src={(isEditing ? editData.banner : profile.banner) || ""}
              alt="Cover"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* Avatar Image Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="relative max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAvatarModal(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:bg-white/20 rounded-full transition-all"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={
                (isEditing ? editData.avatar : profile.avatar) ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  fullName
                )}&background=0066cc&color=fff&size=500`
              }
              alt={fullName}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            {/* Change Profile Picture Button - only show in edit mode */}
            {isEditing && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setShowAvatarModal(false);
                    avatarInputRef.current?.click();
                  }}
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                  <span>Change Profile Picture</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {showExperienceModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowExperienceModal(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingExperienceIndex !== null
                  ? "Edit Experience"
                  : "Add Experience"}
              </h3>
              <button
                onClick={() => setShowExperienceModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={experienceForm.title}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ex: Software Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={experienceForm.company}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      company: e.target.value,
                    })
                  }
                  placeholder="Ex: Google"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Type
                </label>
                <select
                  value={experienceForm.employmentType}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      employmentType: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Internship">Internship</option>
                  <option value="Contract">Contract</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={experienceForm.location}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Ex: San Francisco, CA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isCurrent"
                  checked={experienceForm.isCurrent}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      isCurrent: e.target.checked,
                      endDate: e.target.checked ? "" : experienceForm.endDate,
                    })
                  }
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label
                  htmlFor="isCurrent"
                  className="text-sm font-medium text-gray-700"
                >
                  I currently work here
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={experienceForm.startDate}
                    onChange={(e) =>
                      setExperienceForm({
                        ...experienceForm,
                        startDate: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {!experienceForm.isCurrent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={experienceForm.endDate}
                      onChange={(e) =>
                        setExperienceForm({
                          ...experienceForm,
                          endDate: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={experienceForm.description}
                  onChange={(e) =>
                    setExperienceForm({
                      ...experienceForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe your responsibilities and achievements..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t">
              <button
                onClick={() => setShowExperienceModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveExperience}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Featured Modal */}
      {showFeaturedModal && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFeaturedModal(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">
                {editingFeaturedIndex !== null
                  ? "Edit Featured"
                  : "Add Featured"}
              </h3>
              <button
                onClick={() => setShowFeaturedModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={featuredForm.type}
                  onChange={(e) =>
                    setFeaturedForm({
                      ...featuredForm,
                      type: e.target.value as any,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="post">Post</option>
                  <option value="article">Article</option>
                  <option value="project">Project</option>
                  <option value="certification">Certification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={featuredForm.title}
                  onChange={(e) =>
                    setFeaturedForm({ ...featuredForm, title: e.target.value })
                  }
                  placeholder="Ex: My Latest Project"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={featuredForm.description}
                  onChange={(e) =>
                    setFeaturedForm({
                      ...featuredForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe what you want to feature..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={featuredForm.imageUrl}
                  onChange={(e) =>
                    setFeaturedForm({
                      ...featuredForm,
                      imageUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link
                </label>
                <input
                  type="url"
                  value={featuredForm.link}
                  onChange={(e) =>
                    setFeaturedForm({ ...featuredForm, link: e.target.value })
                  }
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={featuredForm.date}
                  onChange={(e) =>
                    setFeaturedForm({ ...featuredForm, date: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 border-t">
              <button
                onClick={() => setShowFeaturedModal(false)}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeatured}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Experience Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteExperienceConfirm}
        onClose={() => {
          setShowDeleteExperienceConfirm(false);
          setDeleteExperienceIndex(null);
        }}
        onConfirm={handleDeleteExperience}
        title="Delete Experience"
        message="Are you sure you want to delete this experience?"
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Delete Featured Item Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteFeaturedConfirm}
        onClose={() => {
          setShowDeleteFeaturedConfirm(false);
          setDeleteFeaturedIndex(null);
        }}
        onConfirm={handleDeleteFeatured}
        title="Delete Featured Item"
        message="Are you sure you want to delete this featured item?"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Profile;
