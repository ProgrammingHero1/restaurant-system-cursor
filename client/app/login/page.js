import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="hero min-h-screen bg-base-200">
      <div className="hero-content">
        <div className="card bg-base-100 w-full max-w-sm shadow-xl">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
