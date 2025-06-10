import AuthCard from "@/components/auth/AuthCard"
import RegisterForm from "@/components/auth/RegisterForm"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <AuthCard
        title="Create Account"
        description="Sign up to get started with your account."
        footer={
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        }
      >
        <RegisterForm />
      </AuthCard>
    </div>
  )
}
