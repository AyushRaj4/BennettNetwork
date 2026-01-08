import { Check, ArrowRight } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "BASIC",
      fee: "5% fee after hiring",
      description: "For starting out on our global freelancer marketplace",
      features: [
        "Free to post jobs on our global freelance marketplace",
        "AI-powered features",
        "Collaboration and project tracking tools",
      ],
      cta: "Get started for free",
      popular: false,
    },
    {
      name: "BUSINESS PLUS",
      fee: "10% fee after hiring",
      description: "For growing businesses with premium features and support",
      features: [
        "Access to pre-screened top 1% of talent",
        "Premium customer support 24/7",
        "60 invites per job post",
      ],
      cta: "Get started for free",
      popular: true,
    },
    {
      name: "ENTERPRISE",
      fee: "Contact sales",
      description:
        "For scaling comprehensive solutions to the entire organization",
      features: [
        "Dedicated account and program management",
        "SSO and integrations",
        "Unlimited invites per job",
      ],
      cta: "Contact sales",
      popular: false,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Choose the plan that's right for you
          </h2>
          <p className="text-xl text-gray-600">
            Start for free, scale as you grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "border-4 border-[#14a800] shadow-2xl scale-105"
                  : "border-2 border-gray-200 hover:border-[#14a800] hover:shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-[#14a800] text-white px-6 py-2 rounded-full text-sm font-semibold">
                    Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-500 tracking-wider mb-2">
                    {plan.name}
                  </h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.fee}
                    </span>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="h-6 w-6 text-[#14a800] mr-3 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-4 rounded-full font-semibold flex items-center justify-center group transition-all duration-300 ${
                    plan.popular
                      ? "bg-[#14a800] hover:bg-[#108a00] text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="text-[#14a800] hover:text-[#108a00] font-semibold text-lg flex items-center mx-auto group">
            Compare all pricing plans
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
