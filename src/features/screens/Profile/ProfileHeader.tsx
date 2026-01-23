import React from "react";

import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Pencil, Check, X } from "lucide-react";

interface ProfileHeaderProps {
  initialName: string;
  initialAvatar: string;
}

export function ProfileHeader({
  initialName,
  initialAvatar,
}: ProfileHeaderProps) {
  const [name, setName] = useState(initialName);
  const [avatar, setAvatar] = useState(initialAvatar);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(name);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setName(tempName.trim());
    }
    setIsEditingName(false);
  };

  const handleCancelEdit = () => {
    setTempName(name);
    setIsEditingName(false);
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col items-center gap-6 pb-8 border-b border-border">
      {/* Avatar Section */}
      <div className="relative group">
        <Avatar className="size-32 ring-4 ring-background shadow-xl">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={name} />
          <AvatarFallback className="text-3xl font-semibold bg-accent text-accent-foreground">
            {getInitials(name)}
          </AvatarFallback>
        </Avatar>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute inset-0 flex items-center justify-center bg-foreground/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="Change profile picture"
        >
          <Camera className="size-8 text-background" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="hidden"
          aria-label="Upload profile picture"
        />
      </div>

      {/* Name Section */}
      <div className="flex flex-col items-center gap-2">
        {isEditingName ? (
          <div className="flex items-center gap-2">
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="text-center text-xl font-semibold w-64"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveName();
                if (e.key === "Escape") handleCancelEdit();
              }}
            />
            <Button
              size="icon"
              variant="ghost"
              onClick={handleSaveName}
              className="text-muted-foreground hover:text-success"
              aria-label="Save name"
            >
              <Check className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={handleCancelEdit}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Cancel editing"
            >
              <X className="size-5" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group/name">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {name}
            </h1>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsEditingName(true)}
              className="opacity-0 group-hover/name:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
              aria-label="Edit name"
            >
              <Pencil className="size-4" />
            </Button>
          </div>
        )}
        <p className="text-muted-foreground">View and manage your profile</p>
      </div>
    </div>
  );
}
