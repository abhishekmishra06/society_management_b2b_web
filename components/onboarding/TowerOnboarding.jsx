
"use client";

import { Building2 } from "lucide-react";
import AddTowerDialog from "../AddTowerDialog";
import { useTowers } from "@/lib/api/queries";

export default function TowerOnboarding() {
  const { data: towers, isLoading } = useTowers();

  if (isLoading) return null;

  if (towers && towers.length > 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center">

      <div className="max-w-md w-full text-center space-y-6 p-8 border rounded-xl shadow-lg bg-card">

        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-primary/10">
            <Building2 className="h-10 w-10 text-primary" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold">Welcome 👋</h2>
          <p className="text-muted-foreground mt-2">
            To get started, create your first tower/building.
          </p>
        </div>

        <AddTowerDialog />

      </div>

    </div>
  );
}