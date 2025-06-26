import { Card, CardContent } from "@/components/ui/card";
import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">💰</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Expenso</h1>
            <p className="text-gray-600 mt-2">Track your expenses effortlessly</p>
          </div>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  );
}
