"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: session?.user?.name || "",
    bio: "",
    social: {
      website: "",
      twitter: "",
      linkedin: "",
      github: "",
    },
    tags: [],
    resumeUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setMessage("Profile updated!");
      } else {
        setMessage("Failed to update profile");
      }
    } catch {
      setMessage("Error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Please sign in</div>;

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input
            type="text"
            className="w-full bg-dark-200 rounded-md px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Bio</label>
          <textarea
            className="w-full bg-dark-200 rounded-md px-3 py-2 h-24"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
            placeholder="Tell us about yourself..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Website</label>
          <input
            type="url"
            className="w-full bg-dark-200 rounded-md px-3 py-2"
            value={formData.social.website}
            onChange={(e) => setFormData({...formData, social: {...formData.social, website: e.target.value}})}
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">LinkedIn</label>
            <input
              type="text"
              className="w-full bg-dark-200 rounded-md px-3 py-2"
              value={formData.social.linkedin}
              onChange={(e) => setFormData({...formData, social: {...formData.social, linkedin: e.target.value}})}
              placeholder="linkedin.com/in/yourname"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">GitHub</label>
            <input
              type="text"
              className="w-full bg-dark-200 rounded-md px-3 py-2"
              value={formData.social.github}
              onChange={(e) => setFormData({...formData, social: {...formData.social, github: e.target.value}})}
              placeholder="github.com/yourusername"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Resume/Portfolio URL</label>
          <input
            type="url"
            className="w-full bg-dark-200 rounded-md px-3 py-2"
            value={formData.resumeUrl}
            onChange={(e) => setFormData({...formData, resumeUrl: e.target.value})}
            placeholder="https://drive.google.com/resume"
          />
        </div>

        {message && <p className="text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-primary text-black px-6 py-2 rounded-md hover:bg-primary/90"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </main>
  );
}