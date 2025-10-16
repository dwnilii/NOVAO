import { UserLoginForm } from "@/components/user-login-form";

export default function UserLoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden p-4">
      <div className="z-10 flex flex-col items-center text-center">
        <h1 className="text-5xl font-bold md:text-7xl">
          Novao
        </h1>
        <p className="mt-4 max-w-xl text-lg text-foreground/80">
          Access your user dashboard.
        </p>
      </div>
      <UserLoginForm className="z-10 mt-8 w-full max-w-sm" />
    </main>
  );
}
