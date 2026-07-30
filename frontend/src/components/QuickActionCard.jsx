import React from "react";
import Card from "./ui/Card";
import Button from "./ui/Button";

export default function QuickActionCard({
  onExam,
  onResult,
  onProfile,
}) {
  return (
    <Card className="p-6">

      <h2 className="text-slate-900 text-lg font-bold mb-4">
        Quick Actions
      </h2>

      <div className="space-y-4">

        <Button
          className="w-full"
          onClick={onExam}
        >
          Start Exam
        </Button>

        <Button
          variant="success"
          className="w-full"
          onClick={onResult}
        >
          View Results
        </Button>

        <Button
          variant="outline"
          className="w-full"
          onClick={onProfile}
        >
          Edit Profile
        </Button>

      </div>

    </Card>
  );
}