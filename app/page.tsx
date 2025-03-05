import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-tl from-white to-blue-50 relative overflow-hidden">
      {/* Header */}
      <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Masai School
      </h1>
      <p className="text-xl text-gray-600 mb-12 font-light max-w-md text-center leading-relaxed">
        Collaborate, code, and learn with our pair programming platform.
      </p>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-6 z-10">
        <Link href="/auth/login">
          <button className="relative bg-transparent text-indigo-600 font-semibold py-3 px-10 border-2 border-indigo-600 rounded-full hover:bg-indigo-600 hover:text-white transition-all duration-300 ease-in-out group">
            <span className="relative z-10">Login</span>
            <div className="absolute inset-0 bg-indigo-600 rounded-full scale-0 group-hover:scale-100 transition-transform duration-300 origin-center opacity-10"></div>
          </button>
        </Link>
        <Link href="/auth/signup">
          <button className="bg-indigo-600 text-white font-semibold py-3 px-10 rounded-full hover:bg-indigo-700 transition-all duration-300 ease-in-out transform hover:scale-105">
            Sign Up
          </button>
        </Link>
      </div>

      {/* Subtle Background Elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20 filter blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-indigo-100 rounded-full opacity-20 filter blur-3xl animate-float animation-delay-2000"></div>
      </div>

      {/* Footer Text */}
      <p className="absolute bottom-6 text-sm text-gray-400 font-light">
        Built for the future of coding education
      </p>
    </main>
  );
}