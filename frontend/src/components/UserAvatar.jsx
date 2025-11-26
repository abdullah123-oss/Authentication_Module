import React from "react";
import { getImageUrl } from "../utils/imageUrl";

export default function UserAvatar({ user }) {
  if (user?.profilePic) {
    return (
      <img
        src={getImageUrl(user.profilePic)}
        className="w-10 h-10 rounded-full object-cover shadow"
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-white text-blue-800 flex items-center justify-center font-bold shadow">
      {user?.name?.[0]?.toUpperCase() || "P"}
    </div>
  );
}
