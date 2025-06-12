import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">User Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p>User profile information and management options will be available here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
