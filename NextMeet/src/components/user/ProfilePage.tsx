import { useEffect, useMemo, useState } from "react";
import { Camera, Check, Mail, UserRound, Briefcase, Sparkles } from "lucide-react";

type UserProfile = {
  _id?: string;
  name?: string;
  email?: string;
  bio?: string;
  profileImage?: string;
  skills?: string[];
  experience?: number;
  authProvider?: "local" | "google";
  role?: string;
  createdAt?: string;
};

const emptyProfile: UserProfile = {
  name: "",
  email: "",
  bio: "",
  profileImage: "",
  skills: [],
  experience: 0,
  authProvider: "local",
};

const normalizeSkills = (skills: string[] | undefined) =>
  Array.isArray(skills) ? skills.filter(Boolean).map((skill) => skill.trim()) : [];

const ProfilePage = () => {
  const [form, setForm] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isGoogleUser = form.authProvider === "google";

  const avatarUrl = useMemo(() => {
    if (form.profileImage?.trim()) return form.profileImage.trim();
    const initials = (form.name || "User").trim().charAt(0).toUpperCase() || "U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=5b3fd6&color=fff&size=256`;
  }, [form.name, form.profileImage]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          credentials: "include",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || "Unable to load your profile.");
        }

        const user = data.user ?? data;
        const nextProfile = {
          ...emptyProfile,
          ...user,
          skills: normalizeSkills(user?.skills),
          authProvider: user?.authProvider ?? "local",
        };

        setForm(nextProfile);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : "Unable to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const updateField = <K extends keyof UserProfile>(field: K, value: UserProfile[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");

    const cleanName = (form.name ?? "").trim();
    if (!cleanName) {
      setError("Name is required.");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: cleanName,
        bio: form.bio ?? "",
        profileImage: form.profileImage ?? "",
        skills: normalizeSkills(form.skills),
        experience: Number(form.experience ?? 0),
        ...(isGoogleUser ? {} : { email: (form.email ?? "").trim().toLowerCase() }),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || "Profile update failed.");
      }

      const nextProfile = {
        ...emptyProfile,
        ...(data.user ?? data),
        skills: normalizeSkills(data.user?.skills ?? form.skills),
        authProvider: data.user?.authProvider ?? form.authProvider ?? "local",
      };

      setForm(nextProfile);
      setSuccess("Profile updated successfully.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="p-[30px] px-[38px]">
        <div className="rounded-xl border border-[#e8e8ef] bg-white p-6 text-sm text-[#656982] shadow-sm">
          Loading profile...
        </div>
      </section>
    );
  }

  return (
    <section className="p-[30px] px-[38px]">
      <div className="mb-7">
        <h1 className="mb-1 text-[30px] font-bold text-[#171a3a]">Profile</h1>
        <p className="text-[15px] text-[#656982]">Manage your account details and preferences</p>
      </div>

      <div className="grid gap-[26px] lg:grid-cols-[0.8fr_1.4fr]">
        <div className="overflow-hidden rounded-xl border border-[#e8e8ef] bg-white shadow-sm">
          <div className="relative h-[180px] bg-gradient-to-r from-[#f0edff] via-[#eeefff] to-[#f5f4ff]">
            <div className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-[#ddd9f3] bg-white text-[#4c5273]">
              <Camera size={18} />
            </div>
          </div>

          <div className="px-[26px] pb-7 text-center">
            <div className="relative mx-auto -mt-[60px] mb-3 h-[120px] w-[120px]">
              <img
                src={avatarUrl}
                alt={form.name || "User profile"}
                className="h-[120px] w-[120px] rounded-full border-4 border-white object-cover shadow-sm"
                onError={(event) => {
                  event.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent((form.name || "User").trim() || "U")}&background=5b3fd6&color=fff&size=256`;
                }}
              />

              <div className="absolute bottom-1 right-0 flex h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] border-white bg-[#5b3fd6] text-white">
                <Camera size={17} />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#191c40]">{form.name || "Your name"}</h2>
            <p className="mt-1 text-[#686d88]">
              {form.role || (isGoogleUser ? "Google account" : "Member")}
            </p>

            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-[#eafaf0] px-3 py-1.5 text-[13px] text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online
            </div>

            <div className="my-6 h-px bg-[#e9e9ef]" />

            <div className="flex flex-col gap-5 text-left">
              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <Mail size={19} className="text-[#646b91]" />
                <span>{form.email || "No email available"}</span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <Briefcase size={19} className="text-[#646b91]" />
                <span>{form.experience ? `${form.experience} years experience` : "Experience not specified"}</span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <Sparkles size={19} className="text-[#646b91]" />
                <span>{normalizeSkills(form.skills).length > 0 ? normalizeSkills(form.skills).join(", ") : "No skills added yet"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#e8e8ef] bg-white p-[25px] shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[19px] font-bold text-[#191c40]">Edit Profile Details</h2>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dedee8] bg-white text-[#555b79]">
              <UserRound size={18} />
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">Full Name</label>
                <input
                  type="text"
                  value={form.name ?? ""}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none transition focus:border-[#5b3fd6]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">Experience (years)</label>
                <input
                  type="number"
                  min={0}
                  value={Number(form.experience ?? 0)}
                  onChange={(event) => updateField("experience", Number(event.target.value || 0))}
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none transition focus:border-[#5b3fd6]"
                />
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">Email</label>
                <input
                  type="email"
                  value={form.email ?? ""}
                  readOnly={isGoogleUser}
                  onChange={(event) => updateField("email", event.target.value)}
                  className={`w-full rounded-lg border px-[13px] py-3 text-sm text-[#30344f] outline-none transition ${
                    isGoogleUser
                      ? "border-[#e8e8ef] bg-[#f7f7fa] text-[#656982]"
                      : "border-[#dedee8] focus:border-[#5b3fd6]"
                  }`}
                />
                {isGoogleUser && (
                  <span className="text-xs text-[#85899f]">Google-linked email is read-only.</span>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">Profile image URL</label>
                <input
                  type="url"
                  value={form.profileImage ?? ""}
                  onChange={(event) => updateField("profileImage", event.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none transition focus:border-[#5b3fd6]"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#4d526d]">Skills</label>
              <input
                type="text"
                value={normalizeSkills(form.skills).join(", ")}
                onChange={(event) => updateField("skills", event.target.value.split(",").map((skill) => skill.trim()).filter(Boolean))}
                placeholder="React, Node.js, TypeScript"
                className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none transition focus:border-[#5b3fd6]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-medium text-[#4d526d]">Bio</label>
              <textarea
                value={form.bio ?? ""}
                onChange={(event) => updateField("bio", event.target.value)}
                className="min-h-[130px] w-full resize-y rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none transition focus:border-[#5b3fd6]"
                placeholder="Write a short bio..."
              />
            </div>

            {(error || success) && (
              <div className={`rounded-lg border px-3 py-2 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {error || success}
              </div>
            )}

            <div className="mt-1 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-[#5b3fd6] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#4d32c5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Changes"}
                {!saving && <Check size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfilePage;