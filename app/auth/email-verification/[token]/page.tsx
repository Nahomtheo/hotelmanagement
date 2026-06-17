import Link from "next/link";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function EmailVerificationPage({
  params,
}: PageProps) {
  const { token } = await params;

  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";
      console.log(`Base URL: ${baseUrl}`);
      console.log(`Token is : ${token}`);

    const res = await fetch(
      `${baseUrl}/api/auth/verify-email/${token}`,
      {
        method: "GET",
        cache: "no-store",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <span className="text-4xl">❌</span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mt-6">
              Verification Failed
            </h1>

            <p className="text-gray-600 mt-3">
              {data.message ||
                "This verification link is invalid or has expired."}
            </p>

            <Link
              href="/auth/login"
              className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Go to Login
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-4xl">✅</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-6">
            Email Verified!
          </h1>

          <p className="text-gray-600 mt-3">
            Thank you for verifying your email address. You can now log in to
            your account.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Verification error:", error);

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-4xl">⚠️</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mt-6">
            Something Went Wrong
          </h1>

          <p className="text-gray-600 mt-3">
            An error occurred while verifying your email.
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }
}