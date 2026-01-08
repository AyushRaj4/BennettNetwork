import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authService, userService } from "../services/api";
import type {
  User,
  UserProfile,
  LoginData,
  RegisterData,
} from "../services/api";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem("token");
        const storedUser = localStorage.getItem("user");

        if (storedToken && storedUser) {
          setToken(storedToken);
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Ensure profile exists
          await ensureProfile(userData);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authService.login(data);
      const { token: newToken, ...userData } = response;

      // Store auth data
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      // Ensure profile exists before completing login
      await ensureProfile(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authService.register(data);
      const { token: newToken, ...userData } = response;

      // Store auth data
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(userData));
      setToken(newToken);
      setUser(userData);

      // Ensure profile exists before completing registration
      await ensureProfile(userData);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const ensureProfile = async (userData: User) => {
    try {
      // Try to get existing profile
      const profile = await userService.getMyProfile();
      setProfile(profile);
    } catch (error: any) {
      // If profile doesn't exist (404), create one
      if (error.response?.status === 404) {
        try {
          const nameParts = userData.fullName.split(" ");
          const firstName = nameParts[0];
          const lastName = nameParts.slice(1).join(" ") || "";

          const newProfile = await userService.createProfile({
            userId: userData.id,
            firstName,
            lastName,
            email: userData.email,
            role: userData.role,
          });
          setProfile(newProfile);
        } catch (createError) {
          console.error("Failed to create profile:", createError);
        }
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setProfile(null);
    window.location.href = "/";
  };

  const refreshProfile = async () => {
    try {
      const profile = await userService.getMyProfile();
      setProfile(profile);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
    }
  };

  const value = {
    user,
    profile,
    token,
    loading,
    login,
    register,
    logout,
    refreshProfile,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
