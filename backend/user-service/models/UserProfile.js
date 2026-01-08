const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: "Auth",
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["student", "professor", "alumni", "admin"],
      required: true,
    },
    avatar: {
      type: String,
      default:
        "https://ui-avatars.com/api/?name=User&background=0066cc&color=fff",
    },
    banner: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      maxlength: 500,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
    location: {
      city: String,
      state: String,
      country: String,
    },
    contact: {
      phone: String,
      alternateEmail: String,
    },
    // Student specific fields
    studentInfo: {
      rollNumber: String,
      batch: String,
      department: String,
      semester: Number,
      cgpa: Number,
    },
    // Professor specific fields
    professorInfo: {
      employeeId: String,
      department: String,
      designation: String,
      specialization: [String],
    },
    // Alumni specific fields
    alumniInfo: {
      graduationYear: Number,
      department: String,
      currentCompany: String,
      currentPosition: String,
    },
    skills: [String],
    interests: [String],
    languages: [String],
    socialLinks: {
      linkedin: String,
      github: String,
      twitter: String,
      portfolio: String,
    },
    experience: [
      {
        title: String,
        company: String,
        employmentType: String,
        location: String,
        startDate: Date,
        endDate: Date,
        isCurrent: Boolean,
        description: String,
      },
    ],
    activities: [
      {
        type: {
          type: String,
          enum: ["post", "article", "achievement", "event"],
        },
        title: String,
        description: String,
        imageUrl: String,
        link: String,
        date: Date,
        likes: { type: Number, default: 0 },
        comments: { type: Number, default: 0 },
        shares: { type: Number, default: 0 },
      },
    ],
    featured: [
      {
        type: {
          type: String,
          enum: ["post", "article", "project", "certification"],
        },
        title: String,
        description: String,
        imageUrl: String,
        link: String,
        date: Date,
      },
    ],
    stats: {
      connections: { type: Number, default: 0 },
      posts: { type: Number, default: 0 },
      followers: { type: Number, default: 0 },
    },
    settings: {
      profileVisibility: {
        type: String,
        enum: ["public", "connections", "private"],
        default: "public",
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      showActivity: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Index for search
userProfileSchema.index({ firstName: "text", lastName: "text", title: "text" });

module.exports = mongoose.model("UserProfile", userProfileSchema);
