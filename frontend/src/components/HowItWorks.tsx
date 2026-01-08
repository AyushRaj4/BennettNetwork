import { useState } from "react";
import { CheckCircle, DollarSign, Users, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState<"hiring" | "finding">("hiring");

  const hiringSteps = [
    {
      icon: CheckCircle,
      title: "Posting jobs is always free",
      description:
        "Generate a job post with AI or create your own and filter talent matches.",
      cta: "Create a job",
    },
    {
      icon: DollarSign,
      title: "Get insights into freelancer pricing",
      description:
        "We'll calculate the average cost for freelancers with the skills you need.",
      cta: "Next",
    },
    {
      icon: Users,
      title: "Clients only pay after hiring",
      description:
        "Review proposals, interview talent, and pay only when you hire.",
      cta: "Get started",
    },
  ];

  const findingSteps = [
    {
      icon: CheckCircle,
      title: "Create your free profile",
      description:
        "Showcase your skills, experience, and portfolio to attract clients.",
      cta: "Sign up",
    },
    {
      icon: DollarSign,
      title: "Browse jobs and submit proposals",
      description:
        "Find opportunities that match your skills and send compelling proposals.",
      cta: "Find work",
    },
    {
      icon: Users,
      title: "Get hired and paid securely",
      description:
        "Work with clients and receive payments through our secure platform.",
      cta: "Learn more",
    },
  ];

  const steps = activeTab === "hiring" ? hiringSteps : findingSteps;

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">
            How it works
          </h2>

          {/* Tab Switcher */}
          <div className="inline-flex bg-white rounded-full p-1 shadow-md">
            <button
              onClick={() => setActiveTab("hiring")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "hiring"
                  ? "bg-[#14a800] text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              For hiring
            </button>
            <button
              onClick={() => setActiveTab("finding")}
              className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
                activeTab === "finding"
                  ? "bg-[#14a800] text-white"
                  : "text-gray-700 hover:text-gray-900"
              }`}
            >
              For finding work
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 group"
            >
              <div className="space-y-6">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <step.icon className="h-8 w-8 text-[#14a800]" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <button className="text-[#14a800] hover:text-[#108a00] font-semibold flex items-center group/btn">
                  {step.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Step Number */}
              <div className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
