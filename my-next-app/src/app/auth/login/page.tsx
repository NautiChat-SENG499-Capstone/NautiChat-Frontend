import AuthCard from "@/components/auth/AuthCard"
import LoginForm from "@/components/auth/LoginForm"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: "url('/images/ocean-background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <AuthCard
        title="Welcome Back"
        description="Sign in to continue to your account."
        footer={
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </p>
        }
      >
        <LoginForm />
      </AuthCard>
    </div>
  )
}
