import { useState } from "react";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "Software Engineer at Google",
    batch: "Class of 2022, CSE",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    rating: 5,
    text: "Bennett University Network helped me connect with alumni who mentored me throughout my placement journey. The platform made it easy to reach out and get valuable insights from people already working in my dream companies.",
    achievement: "Placed at Google",
  },
  {
    name: "Priya Kapoor",
    role: "Research Scholar at IIT Delhi",
    batch: "Class of 2021, Biotechnology",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    rating: 5,
    text: "The research collaboration features on this platform are exceptional. I connected with professors and fellow researchers, which led to multiple publications and my current position at IIT Delhi.",
    achievement: "3 Research Publications",
  },
  {
    name: "Arjun Mehta",
    role: "Founder, TechStart Solutions",
    batch: "Class of 2020, CSE",
    image: "https://randomuser.me/api/portraits/men/67.jpg",
    rating: 5,
    text: "As an entrepreneur, this network has been invaluable. I found my co-founders, initial team members, and even investors through Bennett connections. The alumni support system is truly remarkable!",
    achievement: "Raised $1M Funding",
  },
  {
    name: "Sneha Patel",
    role: "Product Manager at Flipkart",
    batch: "Class of 2023, MBA",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    rating: 5,
    text: "The opportunities section helped me discover internships and full-time roles that I wouldn't have found elsewhere. The direct connection with Bennett alumni at top companies made all the difference.",
    achievement: "Dream Job Secured",
  },
];

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Success Stories from Our Community
          </h2>
          <p className="text-xl text-gray-600">
            Hear from students and alumni who transformed their careers through
            our network
          </p>
        </div>

        <div className="relative">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-5xl mx-auto">
            <Quote className="h-12 w-12 text-[#0066cc] opacity-20 mb-4" />

            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Testimonial Image */}
              <div className="shrink-0">
                <div className="relative">
                  <img
                    src={testimonials[currentIndex].image}
                    alt={testimonials[currentIndex].name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-[#0066cc] shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                    Verified
                  </div>
                </div>
              </div>

              {/* Testimonial Content */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-4">
                  {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 text-yellow-400 fill-current"
                    />
                  ))}
                </div>

                <p className="text-xl text-gray-700 mb-6 leading-relaxed italic">
                  "{testimonials[currentIndex].text}"
                </p>

                <div className="mb-4">
                  <p className="font-bold text-gray-900 text-xl">
                    {testimonials[currentIndex].name}
                  </p>
                  <p className="text-gray-600 font-medium">
                    {testimonials[currentIndex].role}
                  </p>
                  <p className="text-sm text-gray-500">
                    {testimonials[currentIndex].batch}
                  </p>
                </div>

                <div className="inline-block bg-gradient-to-r from-blue-100 to-indigo-100 text-[#0066cc] px-6 py-2 rounded-full font-semibold">
                  🎉 {testimonials[currentIndex].achievement}
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="bg-[#0066cc] hover:bg-[#0052a3] text-white p-3 rounded-full transition-colors shadow-lg"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextTestimonial}
                className="bg-[#0066cc] hover:bg-[#0052a3] text-white p-3 rounded-full transition-colors shadow-lg"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-[#0066cc] w-8"
                      : "bg-gray-300 w-3"
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
