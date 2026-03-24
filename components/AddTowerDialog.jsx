"use client";

import { useState } from "react";
import { Plus, Loader2, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCreateTower } from "@/lib/api/queries";
import { toast } from "sonner";

export default function AddTowerDialog() {
  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    floors: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  const createTower = useCreateTower();

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tower name is required";
    }

    if (!formData.floors) {
      newErrors.floors = "Number of floors is required";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createTower.mutateAsync(formData);

      toast.success("Tower created successfully");

      setFormData({
        name: "",
        floors: "",
        description: "",
      });

      setOpen(false);
    } catch (err) {
      toast.error("Failed to create tower");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={16} />
          Add Tower
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 size={18} />
            Add New Tower
          </DialogTitle>

          <DialogDescription>
            Create your first tower/building
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label>Tower Name *</Label>
            <Input
              placeholder="Tower A"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Total Floors *</Label>
            <Input
              type="number"
              min="1"
              value={formData.floors}
              onChange={(e) => handleChange("floors", e.target.value)}
            />
            {errors.floors && (
              <p className="text-xs text-red-500">{errors.floors}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Input
              placeholder="Optional description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createTower.isPending}>
              {createTower.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Tower"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}