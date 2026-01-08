import { useState, useEffect } from "react";
import {
  Search,
  UserPlus,
  Mail,
  Filter,
  Users,
  Building2,
  Loader,
  Check,
  X,
  UserMinus,
} from "lucide-react";
import { networkService, type UserSuggestion } from "../services/api";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";

interface NetworkUser extends UserSuggestion {
  connected?: boolean;
  mutualConnections?: number;
  connectionId?: string; // For pending requests
}

interface ModalState {
  isOpen: boolean;
  type: "success" | "error";
  title: string;
  message: string;
}

interface ConfirmModalState {
  isOpen: boolean;
  connectionId: string | null;
  userName: string;
}

const Network = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "connections" | "suggestions" | "pending" | "requests"
  >("suggestions");
  const [suggestions, setSuggestions] = useState<NetworkUser[]>([]);
  const [connections, setConnections] = useState<NetworkUser[]>([]);
  const [sentRequests, setSentRequests] = useState<NetworkUser[]>([]); // Renamed from pendingRequests
  const [incomingRequests, setIncomingRequests] = useState<NetworkUser[]>([]); // New state for incoming requests
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [processingRequest, setProcessingRequest] = useState<string | null>(
    null
  );
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    connectionId: null,
    userName: "",
  });

  const showModal = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setModal({ isOpen: true, type, title, message });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  const fetchNetworkData = async () => {
    try {
      setLoading(true);
      const [suggestionsData, connectionsData, sentData, incomingData] =
        await Promise.all([
          networkService.getSuggestions(),
          networkService.getConnections(),
          networkService.getSentRequests(),
          networkService.getPendingRequests(),
        ]);

      setSuggestions(suggestionsData || []);
      setConnections(connectionsData || []);
      setSentRequests(sentData || []);
      setIncomingRequests(incomingData || []);
    } catch (error) {
      console.error("Error fetching network data:", error);
      showModal(
        "error",
        "Error",
        "Failed to load network data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (userId: string) => {
    try {
      setSendingRequest(userId);
      await networkService.sendConnectionRequest(userId);
      // Refresh data
      await fetchNetworkData();
      showModal("success", "Success", "Connection request sent successfully!");
    } catch (error: any) {
      console.error("Error sending connection request:", error);
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to send connection request"
      );
    } finally {
      setSendingRequest(null);
    }
  };

  const handleAcceptRequest = async (connectionId: string) => {
    try {
      setProcessingRequest(connectionId);
      await networkService.acceptConnectionRequest(connectionId);
      await fetchNetworkData();
      // Notify Header to update the count
      window.dispatchEvent(new Event("networkRequestsUpdated"));
      showModal("success", "Success", "Connection request accepted!");
    } catch (error: any) {
      console.error("Error accepting request:", error);
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to accept request"
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleRejectRequest = async (connectionId: string) => {
    try {
      setProcessingRequest(connectionId);
      await networkService.rejectConnectionRequest(connectionId);
      await fetchNetworkData();
      // Notify Header to update the count
      window.dispatchEvent(new Event("networkRequestsUpdated"));
      showModal("success", "Success", "Connection request rejected");
    } catch (error: any) {
      console.error("Error rejecting request:", error);
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to reject request"
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const openRemoveConfirmation = (connectionId: string, userName: string) => {
    setConfirmModal({
      isOpen: true,
      connectionId,
      userName,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      connectionId: null,
      userName: "",
    });
  };

  const handleRemoveConnection = async () => {
    if (!confirmModal.connectionId) return;

    try {
      setProcessingRequest(confirmModal.connectionId);
      await networkService.removeConnection(confirmModal.connectionId);
      closeConfirmModal();
      await fetchNetworkData();
      showModal("success", "Success", "Connection removed successfully");
    } catch (error: any) {
      console.error("Error removing connection:", error);
      showModal(
        "error",
        "Error",
        error.response?.data?.message || "Failed to remove connection"
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  const getDepartment = (person: NetworkUser) => {
    return (
      person.studentInfo?.department ||
      person.professorInfo?.department ||
      person.alumniInfo?.department ||
      "N/A"
    );
  };

  const getBatch = (person: NetworkUser) => {
    if (person.studentInfo?.batch) return person.studentInfo.batch;
    if (person.professorInfo) return "Faculty";
    if (person.alumniInfo?.currentCompany)
      return `Alumni - ${person.alumniInfo.currentCompany}`;
    return "N/A";
  };

  const getDisplayTitle = (person: NetworkUser) => {
    if (person.title) return person.title;
    if (person.professorInfo?.designation)
      return person.professorInfo.designation;
    if (person.alumniInfo?.currentCompany)
      return `Alumni at ${person.alumniInfo.currentCompany}`;
    return `${person.role.charAt(0).toUpperCase() + person.role.slice(1)}`;
  };

  const getCurrentData = () => {
    if (activeTab === "connections") return connections;
    if (activeTab === "pending") return sentRequests; // Sent requests
    if (activeTab === "requests") return incomingRequests; // Incoming requests
    return suggestions;
  };

  const filteredData = getCurrentData().filter((person: NetworkUser) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const name = `${person.firstName} ${person.lastName}`.toLowerCase();
    const department = getDepartment(person).toLowerCase();
    const batch = getBatch(person).toLowerCase();
    return (
      name.includes(query) ||
      department.includes(query) ||
      batch.includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-[#0066cc] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your network...</p>
        </div>
      </div>
    );
  }

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
                  <span className="font-bold text-[#0066cc]">
                    {connections.length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">Suggestions</span>
                  <span className="font-bold text-gray-900">
                    {suggestions.length}
                  </span>
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
                    User Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0066cc]">
                    <option>All Users</option>
                    <option>Students</option>
                    <option>Professors</option>
                    <option>Alumni</option>
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
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
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
                  Connections ({connections.length})
                  {activeTab === "connections" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("pending")}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === "pending"
                      ? "text-[#0066cc]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Pending ({sentRequests.length})
                  {activeTab === "pending" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("requests")}
                  className={`pb-3 px-4 font-semibold transition-colors relative ${
                    activeTab === "requests"
                      ? "text-[#0066cc]"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="relative inline-flex items-center gap-1">
                    Requests ({incomingRequests.length})
                    {incomingRequests.length > 0 && (
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                  </span>
                  {activeTab === "requests" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066cc]"></div>
                  )}
                </button>
              </div>
            </div>

            {/* People Grid */}
            {filteredData.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {activeTab === "suggestions"
                    ? "No suggestions available"
                    : activeTab === "connections"
                    ? "No connections yet"
                    : activeTab === "pending"
                    ? "No pending requests"
                    : "No incoming requests"}
                </h3>
                <p className="text-gray-600">
                  {activeTab === "suggestions"
                    ? "Check back later for personalized connection suggestions"
                    : activeTab === "connections"
                    ? "Start connecting with people to grow your network"
                    : activeTab === "pending"
                    ? "You haven't sent any connection requests yet"
                    : "You have no incoming connection requests"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredData.map((person: NetworkUser) => (
                  <div
                    key={person.userId}
                    className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          person.avatar ||
                          `https://ui-avatars.com/api/?name=${person.firstName}+${person.lastName}&background=0066cc&color=fff`
                        }
                        alt={`${person.firstName} ${person.lastName}`}
                        className={`w-16 h-16 rounded-full border-2 border-[#0066cc] ${
                          activeTab === "connections"
                            ? "cursor-pointer hover:opacity-80"
                            : ""
                        }`}
                        onClick={() =>
                          activeTab === "connections" &&
                          navigate(`/user/${person.userId}`)
                        }
                      />
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-gray-900 mb-1 ${
                            activeTab === "connections"
                              ? "cursor-pointer hover:text-[#0066cc]"
                              : ""
                          }`}
                          onClick={() =>
                            activeTab === "connections" &&
                            navigate(`/user/${person.userId}`)
                          }
                        >
                          {person.firstName} {person.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {getDisplayTitle(person)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                          <Building2 className="h-3 w-3" />
                          <span>{getDepartment(person)}</span>
                          <span>•</span>
                          <span>{getBatch(person)}</span>
                        </div>
                        {person.matchScore && person.matchScore > 0 && (
                          <div className="mb-3 text-xs">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                              {person.matchScore}% Match
                            </span>
                          </div>
                        )}
                        <div className="flex gap-2">
                          {activeTab === "requests" ? (
                            // Incoming requests - show accept/reject
                            <>
                              <button
                                onClick={() =>
                                  person.connectionId &&
                                  handleAcceptRequest(person.connectionId)
                                }
                                disabled={
                                  processingRequest === person.connectionId
                                }
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingRequest === person.connectionId ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  person.connectionId &&
                                  handleRejectRequest(person.connectionId)
                                }
                                disabled={
                                  processingRequest === person.connectionId
                                }
                                className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingRequest === person.connectionId ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4" />
                                )}
                                Reject
                              </button>
                            </>
                          ) : activeTab === "pending" ? (
                            // Sent requests - show pending status
                            <button
                              disabled
                              className="flex-1 bg-gray-300 text-gray-600 px-4 py-2 rounded-lg font-semibold text-sm cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <Loader className="h-4 w-4" />
                              Pending
                            </button>
                          ) : activeTab === "connections" ? (
                            // Existing connections - show message and remove buttons
                            <>
                              <button
                                onClick={() =>
                                  navigate("/messages", {
                                    state: { userId: person.userId },
                                  })
                                }
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                Message
                              </button>
                              <button
                                onClick={() =>
                                  person.connectionId &&
                                  openRemoveConfirmation(
                                    person.connectionId,
                                    `${person.firstName} ${person.lastName}`
                                  )
                                }
                                disabled={
                                  processingRequest === person.connectionId
                                }
                                className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                title="Remove Connection"
                              >
                                {processingRequest === person.connectionId ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserMinus className="h-4 w-4" />
                                )}
                              </button>
                            </>
                          ) : (
                            // Suggestions - show connect button
                            <button
                              onClick={() => handleConnect(person.userId)}
                              disabled={sendingRequest === person.userId}
                              className="flex-1 bg-[#0066cc] hover:bg-[#0052a3] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {sendingRequest === person.userId ? (
                                <>
                                  <Loader className="h-4 w-4 animate-spin" />
                                  Connecting...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="h-4 w-4" />
                                  Connect
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modal.isOpen}
        onClose={closeModal}
        type={modal.type}
        title={modal.title}
        message={modal.message}
      />

      {/* Confirmation Modal for Remove Connection */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <UserMinus className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Remove Connection
                </h3>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-gray-900">
                {confirmModal.userName}
              </span>{" "}
              from your connections? This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={closeConfirmModal}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemoveConnection}
                disabled={processingRequest === confirmModal.connectionId}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processingRequest === confirmModal.connectionId ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Network;
