import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10">
      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Settings page content will go here. Customize your CodePilot experience.</p>
        </CardContent>
      </Card>
    </div>
  );
}
