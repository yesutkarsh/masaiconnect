import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
      <h1 className="text-3xl font-semibold text-[#333333] mb-8">
        Masai School Pair Programming Platform
      </h1>
      <div className="flex gap-4">
        <Link href="/auth/login">
          <button className="bg-[#3498db] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#2980b9] transition-colors">
            Login
          </button>
        </Link>
        <Link href="/auth/signup">
          <button className="bg-[#2ecc71] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#27ae60] transition-colors">
            Sign Up
          </button>
        </Link>
      </div>
    </main>
  )
}