
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const avatarOptions = [
  "/agent-avatar-0.svg",
  "/agent-avatar-1.svg",
  "/agent-avatar-2.svg"
];

export function AvatarUploadModal({
  open, onClose, onSelect
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (img: string) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);

  if (!open) return null;
  return (
    <div className="fixed top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg mb-2">Avatar wählen / hochladen</h3>
          <Button size="sm" variant="ghost" onClick={onClose}>
            <X />
          </Button>
        </div>
        <div className="flex gap-2 mb-2">
          {avatarOptions.map((av) => (
            <button
              key={av}
              className="rounded-full border-2 p-1"
              onClick={() => { onSelect(av); onClose(); }}
              style={{ borderColor: "#888" }}
            >
              <img src={av} alt={av} className="w-12 h-12" />
            </button>
          ))}
        </div>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInput}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => {
                if (typeof reader.result === "string") {
                  onSelect(reader.result);
                }
                onClose();
              };
              reader.readAsDataURL(file);
            }
          }}
        />
        <Button
          variant="secondary"
          onClick={() => fileInput.current?.click()}
          className="w-full mt-3"
        >
          Eigenes Bild hochladen
        </Button>
      </div>
    </div>
  );
}
