import { useEffect, useRef, useState } from "react";
import {
  Camera,
  Download,
  KeyRound,
  Lock,
  LogOut,
  Monitor,
  Moon,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sun,
  Trash2,
  Volume2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { applyTheme, setThemePreference } from "../../lib/theme";

type Settings = {
  appearance: {
    theme: "light" | "dark" | "system";
    language: "English";
    reducedMotion: boolean;
    keyboardNavigation: boolean;
  };
  meeting: {
    previewBeforeJoin: boolean;
    defaultCameraOn: boolean;
    defaultMicOn: boolean;
    joinDirectly: boolean;
  };
  editor: {
    theme: "dark" | "light" | "system";
    fontSize: number;
    tabSize: 2 | 4 | 8;
    lineNumbers: boolean;
    wordWrap: boolean;
    minimap: boolean;
    defaultLanguage: "javascript" | "typescript" | "python" | "java";
    autoSave: boolean;
  };
  notifications: {
    inApp: boolean;
    email: boolean;
    meetingReminders: boolean;
    joinRequests: boolean;
    interviewReports: boolean;
    sound: boolean;
  };
};

const defaults: Settings = {
  appearance: {
    theme: "system",
    language: "English",
    reducedMotion: false,
    keyboardNavigation: true,
  },
  meeting: {
    previewBeforeJoin: true,
    defaultCameraOn: true,
    defaultMicOn: true,
    joinDirectly: false,
  },
  editor: {
    theme: "dark",
    fontSize: 14,
    tabSize: 2,
    lineNumbers: true,
    wordWrap: false,
    minimap: false,
    defaultLanguage: "javascript",
    autoSave: false,
  },
  notifications: {
    inApp: true,
    email: false,
    meetingReminders: true,
    joinRequests: true,
    interviewReports: true,
    sound: false,
  },
};

type Section =
  | "security"
  | "audio"
  | "meetings"
  | "editor"
  | "notifications"
  | "privacy"
  | "appearance";
const sections: { id: Section; label: string; icon: typeof Shield }[] = [
  { id: "security", label: "Account security", icon: Shield },
  { id: "audio", label: "Audio & video", icon: Camera },
  { id: "meetings", label: "Meeting preferences", icon: Monitor },
  { id: "editor", label: "Code editor", icon: SettingsIcon },
  { id: "notifications", label: "Notifications", icon: Volume2 },
  { id: "privacy", label: "Privacy & permissions", icon: Lock },
  { id: "appearance", label: "Appearance & access", icon: Sun },
];

const apiUrl = (() => {
  const configuredUrl = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
  return configuredUrl.endsWith("/api")
    ? configuredUrl
    : `${configuredUrl || ""}/api`;
})();
const copySettings = (value: Settings): Settings =>
  JSON.parse(JSON.stringify(value)) as Settings;

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-[#5b3fd6]" : "bg-[#d9dbe5]"}`}
    >
      <span
        className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${checked ? "left-6" : "left-1"}`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#f0f1f6] py-4 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-[#30344f]">{title}</p>
        <p className="mt-1 text-xs leading-5 text-[#85899f]">{description}</p>
      </div>
      {children}
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-[#e8e8ef] bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-[#191c40]">{title}</h2>
      <p className="mt-1 text-sm text-[#85899f]">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const [section, setSection] = useState<Section>("security");
  const [settings, setSettings] = useState<Settings>(defaults);
  const [authProvider, setAuthProvider] = useState<string>("local");
  const [activeSessions, setActiveSessions] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [microphoneId, setMicrophoneId] = useState("");
  const [speakerId, setSpeakerId] = useState("");
  const [previewing, setPreviewing] = useState(false);
  const [deviceMessage, setDeviceMessage] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await fetch(`${apiUrl}/user/settings`, {
          credentials: "include",
        });
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.message || "Unable to load settings");
        setSettings({
          ...defaults,
          ...data.settings,
          appearance: { ...defaults.appearance, ...data.settings?.appearance },
          meeting: { ...defaults.meeting, ...data.settings?.meeting },
          editor: { ...defaults.editor, ...data.settings?.editor },
          notifications: {
            ...defaults.notifications,
            ...data.settings?.notifications,
          },
        });
        setAuthProvider(data.authProvider || "local");
        setActiveSessions(Number(data.activeSessions || 0));
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load settings",
        );
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    applyTheme(settings.appearance.theme);
  }, [settings.appearance.theme]);

  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  const update = <T extends keyof Settings>(
    group: T,
    key: keyof Settings[T],
    value: Settings[T][keyof Settings[T]],
  ) => {
    setSettings((current) => ({
      ...current,
      [group]: { ...current[group], [key]: value },
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setStatus("");
    try {
      const response = await fetch(`${apiUrl}/user/settings`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Unable to save settings");
      setSettings((current) => ({ ...current, ...data.settings }));
      localStorage.setItem("nextmeet-settings", JSON.stringify(settings));
      setStatus("Changes saved");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Unable to save settings",
      );
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(copySettings(defaults));
    setThemePreference(defaults.appearance.theme);
    setStatus("Reset to defaults. Save to apply.");
    setError("");
  };

  const loadDevices = async () => {
    try {
      const permissionStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      permissionStream.getTracks().forEach((track) => track.stop());
      const available = await navigator.mediaDevices.enumerateDevices();
      setDevices(available);
      setCameraId(
        (current) =>
          current ||
          available.find((device) => device.kind === "videoinput")?.deviceId ||
          "",
      );
      setMicrophoneId(
        (current) =>
          current ||
          available.find((device) => device.kind === "audioinput")?.deviceId ||
          "",
      );
      setSpeakerId(
        (current) =>
          current ||
          available.find((device) => device.kind === "audiooutput")?.deviceId ||
          "",
      );
      setDeviceMessage("Devices detected");
    } catch {
      setDeviceMessage(
        "Camera and microphone permission is required to detect devices.",
      );
    }
  };

  const startPreview = async () => {
    try {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraId ? { deviceId: { exact: cameraId } } : true,
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setPreviewing(true);
    } catch {
      setDeviceMessage("Unable to start camera preview.");
    }
  };

  const stopPreview = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setPreviewing(false);
  };
  const testMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: microphoneId ? { deviceId: { exact: microphoneId } } : true,
      });
      stream.getTracks().forEach((track) => track.stop());
      setDeviceMessage("Microphone is working");
    } catch {
      setDeviceMessage("Unable to access the microphone");
    }
  };
  const testSpeaker = () => {
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.frequency.value = 660;
    gain.gain.value = 0.05;
    oscillator.start();
    oscillator.stop(context.currentTime + 0.25);
    setDeviceMessage("Speaker test played");
  };

  const changePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setStatus("");
    if (passwords.newPassword.length < 6)
      return setError("New password must be at least 6 characters.");
    if (passwords.newPassword !== passwords.confirmPassword)
      return setError("New passwords do not match.");
    const response = await fetch(`${apiUrl}/user/settings/password`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      }),
    });
    const data = await response.json();
    if (!response.ok)
      return setError(data.message || "Unable to change password");
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setStatus(data.message);
    await logout();
    navigate("/login", { replace: true });
  };

  const logoutAll = async () => {
    const response = await fetch(`${apiUrl}/user/settings/logout-all`, {
      method: "POST",
      credentials: "include",
    });
    if (response.ok) {
      await logout();
      navigate("/login", { replace: true });
    } else setError("Unable to sign out other sessions");
  };
  const deleteAccount = async () => {
    if (
      !window.confirm(
        "Delete your NextMeet account permanently? This cannot be undone.",
      )
    )
      return;
    const response = await fetch(`${apiUrl}/user/settings/account`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: passwords.currentPassword }),
    });
    const data = await response.json();
    if (!response.ok)
      return setError(data.message || "Unable to delete account");
    await logout();
    navigate("/login", { replace: true });
  };
  const exportData = async () => {
    const response = await fetch(`${apiUrl}/user/settings/export`, {
      credentials: "include",
    });
    if (!response.ok) return setError("Unable to export account data");
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "nextmeet-account-data.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading)
    return (
      <div className="p-8 text-center text-sm text-[#656982]">
        Loading settings...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#f8f8fc] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-[#171a3a]">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[#656982]">
            Manage your NextMeet experience without changing your profile.
          </p>
        </div>
        {(error || status) && (
          <div
            role={error ? "alert" : "status"}
            className={`mb-5 rounded-xl border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-600" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
          >
            {error || status}
          </div>
        )}
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="h-fit rounded-2xl border border-[#e8e8ef] bg-white p-2 shadow-sm">
            <p className="px-3 pb-2 pt-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#999caf]">
              Settings
            </p>
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${section === id ? "bg-[#f0edff] font-semibold text-[#5b3fd6]" : "text-[#555a73] hover:bg-[#fafafd]"}`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </nav>
          <main className="min-w-0 space-y-5">
            {section === "security" && (
              <>
                <SectionCard
                  title="Account security"
                  description="Protect access to your account and manage active sessions."
                >
                  <form
                    onSubmit={changePassword}
                    className="grid gap-3 sm:grid-cols-3"
                  >
                    <input
                      required
                      type="password"
                      placeholder="Current password"
                      autoComplete="current-password"
                      value={passwords.currentPassword}
                      onChange={(event) =>
                        setPasswords({
                          ...passwords,
                          currentPassword: event.target.value,
                        })
                      }
                      className="h-11 rounded-lg border border-[#dedee8] px-3 text-sm"
                    />
                    <input
                      required
                      type="password"
                      placeholder="New password"
                      autoComplete="new-password"
                      value={passwords.newPassword}
                      onChange={(event) =>
                        setPasswords({
                          ...passwords,
                          newPassword: event.target.value,
                        })
                      }
                      className="h-11 rounded-lg border border-[#dedee8] px-3 text-sm"
                    />
                    <input
                      required
                      type="password"
                      placeholder="Confirm password"
                      autoComplete="new-password"
                      value={passwords.confirmPassword}
                      onChange={(event) =>
                        setPasswords({
                          ...passwords,
                          confirmPassword: event.target.value,
                        })
                      }
                      className="h-11 rounded-lg border border-[#dedee8] px-3 text-sm"
                    />
                    <button className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5b3fd6] px-4 text-sm font-medium text-white sm:col-span-3 sm:w-fit">
                      <KeyRound size={16} />
                      Change password
                    </button>
                  </form>
                </SectionCard>
                <SectionCard
                  title="Connected sign-in"
                  description="Your authentication provider for this account."
                >
                  <SettingRow
                    title="Google OAuth"
                    description={
                      authProvider === "google"
                        ? "Connected through Google."
                        : "Not connected. Google sign-in is available when configured."
                    }
                  >
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${authProvider === "google" ? "bg-emerald-50 text-emerald-700" : "bg-[#f5f4f9] text-[#777b93]"}`}
                    >
                      {authProvider === "google"
                        ? "Connected"
                        : "Not connected"}
                    </span>
                  </SettingRow>
                </SectionCard>
                <SectionCard
                  title="Active sessions"
                  description="Sessions are stored securely by the current server session manager."
                >
                  <SettingRow
                    title={`${activeSessions || 1} active session${activeSessions === 1 ? "" : "s"}`}
                    description="Sign out everywhere if you suspect someone else has access."
                  >
                    <button
                      type="button"
                      onClick={() => void logoutAll()}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#dedee8] px-3 py-2 text-xs font-medium text-[#555a73] hover:bg-[#fafafd]"
                    >
                      <LogOut size={14} />
                      Log out all devices
                    </button>
                  </SettingRow>
                </SectionCard>
                <SectionCard
                  title="Danger zone"
                  description="These actions affect your account and cannot be easily reversed."
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Delete account
                      </p>
                      <p className="mt-1 text-xs text-[#85899f]">
                        Your account will be permanently removed.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => void deleteAccount()}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                      Delete account
                    </button>
                  </div>
                </SectionCard>
              </>
            )}
            {section === "audio" && (
              <SectionCard
                title="Audio & video"
                description="Device selection is provided by your browser and applies to this device."
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void loadDevices()}
                    className="rounded-lg bg-[#5b3fd6] px-3 py-2 text-xs font-medium text-white"
                  >
                    Detect devices
                  </button>
                  <button
                    type="button"
                    onClick={
                      previewing ? stopPreview : () => void startPreview()
                    }
                    className="rounded-lg border border-[#dedee8] px-3 py-2 text-xs font-medium text-[#555a73]"
                  >
                    {previewing ? "Stop preview" : "Camera preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void testMicrophone()}
                    className="rounded-lg border border-[#dedee8] px-3 py-2 text-xs font-medium text-[#555a73]"
                  >
                    Test microphone
                  </button>
                  <button
                    type="button"
                    onClick={testSpeaker}
                    className="rounded-lg border border-[#dedee8] px-3 py-2 text-xs font-medium text-[#555a73]"
                  >
                    Test speaker
                  </button>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="text-xs font-medium text-[#555a73]">
                    Camera
                    <select
                      value={cameraId}
                      onChange={(event) => setCameraId(event.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] bg-white px-2 text-sm"
                    >
                      <option value="">Default camera</option>
                      {devices
                        .filter((device) => device.kind === "videoinput")
                        .map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || "Camera"}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium text-[#555a73]">
                    Microphone
                    <select
                      value={microphoneId}
                      onChange={(event) => setMicrophoneId(event.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] bg-white px-2 text-sm"
                    >
                      <option value="">Default microphone</option>
                      {devices
                        .filter((device) => device.kind === "audioinput")
                        .map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || "Microphone"}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label className="text-xs font-medium text-[#555a73]">
                    Speaker
                    <select
                      value={speakerId}
                      onChange={(event) => setSpeakerId(event.target.value)}
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] bg-white px-2 text-sm"
                    >
                      <option value="">Default speaker</option>
                      {devices
                        .filter((device) => device.kind === "audiooutput")
                        .map((device) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || "Speaker"}
                          </option>
                        ))}
                    </select>
                  </label>
                </div>
                {previewing && (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="mt-5 aspect-video max-w-lg rounded-xl bg-black object-cover"
                  />
                )}
                {deviceMessage && (
                  <p className="mt-3 text-xs text-[#656982]">{deviceMessage}</p>
                )}
                <p className="mt-4 text-xs text-[#85899f]">
                  Selected devices are browser-local because the meeting
                  implementation currently reads the browser default devices
                  directly.
                </p>
              </SectionCard>
            )}
            {section === "meetings" && (
              <SectionCard
                title="Meeting preferences"
                description="Choose how the meeting lobby and notifications behave."
              >
                <SettingRow
                  title="Preview before joining"
                  description="Show the camera and microphone lobby before entering."
                >
                  <Toggle
                    checked={settings.meeting.previewBeforeJoin}
                    onChange={(value) =>
                      update("meeting", "previewBeforeJoin", value)
                    }
                    label="Preview before joining"
                  />
                </SettingRow>
                <SettingRow
                  title="Camera on by default"
                  description="Start with your camera enabled in the lobby."
                >
                  <Toggle
                    checked={settings.meeting.defaultCameraOn}
                    onChange={(value) =>
                      update("meeting", "defaultCameraOn", value)
                    }
                    label="Camera on by default"
                  />
                </SettingRow>
                <SettingRow
                  title="Microphone on by default"
                  description="Start with your microphone enabled in the lobby."
                >
                  <Toggle
                    checked={settings.meeting.defaultMicOn}
                    onChange={(value) =>
                      update("meeting", "defaultMicOn", value)
                    }
                    label="Microphone on by default"
                  />
                </SettingRow>
                <SettingRow
                  title="Join directly"
                  description="The current route always uses the pre-join lobby for link joins; this preference is stored for future direct-join support."
                >
                  <Toggle
                    checked={settings.meeting.joinDirectly}
                    onChange={(value) =>
                      update("meeting", "joinDirectly", value)
                    }
                    label="Join directly"
                  />
                </SettingRow>
              </SectionCard>
            )}
            {section === "editor" && (
              <SectionCard
                title="Code editor"
                description="These preferences are saved for your account. Existing Monaco sessions keep interviewer permissions and real-time sync unchanged."
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-xs font-medium text-[#555a73]">
                    Editor theme
                    <select
                      value={settings.editor.theme}
                      onChange={(event) =>
                        update(
                          "editor",
                          "theme",
                          event.target.value as Settings["editor"]["theme"],
                        )
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] px-2 text-sm"
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="system">System</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-[#555a73]">
                    Default language
                    <select
                      value={settings.editor.defaultLanguage}
                      onChange={(event) =>
                        update(
                          "editor",
                          "defaultLanguage",
                          event.target
                            .value as Settings["editor"]["defaultLanguage"],
                        )
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] px-2 text-sm"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                    </select>
                  </label>
                  <label className="text-xs font-medium text-[#555a73]">
                    Font size
                    <input
                      type="number"
                      min="10"
                      max="24"
                      value={settings.editor.fontSize}
                      onChange={(event) =>
                        update("editor", "fontSize", Number(event.target.value))
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] px-2 text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-[#555a73]">
                    Tab size
                    <select
                      value={settings.editor.tabSize}
                      onChange={(event) =>
                        update(
                          "editor",
                          "tabSize",
                          Number(event.target.value) as 2 | 4 | 8,
                        )
                      }
                      className="mt-2 h-10 w-full rounded-lg border border-[#dedee8] px-2 text-sm"
                    >
                      <option value="2">2 spaces</option>
                      <option value="4">4 spaces</option>
                      <option value="8">8 spaces</option>
                    </select>
                  </label>
                </div>
                <div className="mt-4 divide-y divide-[#f0f1f6]">
                  <SettingRow
                    title="Line numbers"
                    description="Show line numbers in the editor."
                  >
                    <Toggle
                      checked={settings.editor.lineNumbers}
                      onChange={(value) =>
                        update("editor", "lineNumbers", value)
                      }
                      label="Line numbers"
                    />
                  </SettingRow>
                  <SettingRow
                    title="Word wrap"
                    description="Wrap long lines inside the editor."
                  >
                    <Toggle
                      checked={settings.editor.wordWrap}
                      onChange={(value) => update("editor", "wordWrap", value)}
                      label="Word wrap"
                    />
                  </SettingRow>
                  <SettingRow
                    title="Minimap"
                    description="Show the code overview minimap."
                  >
                    <Toggle
                      checked={settings.editor.minimap}
                      onChange={(value) => update("editor", "minimap", value)}
                      label="Minimap"
                    />
                  </SettingRow>
                  <SettingRow
                    title="Auto-save"
                    description="Not currently supported by the collaborative editor."
                  >
                    <Toggle
                      checked={settings.editor.autoSave}
                      onChange={(value) => update("editor", "autoSave", value)}
                      label="Auto-save"
                    />
                  </SettingRow>
                </div>
              </SectionCard>
            )}
            {section === "notifications" && (
              <SectionCard
                title="Notifications"
                description="Choose which supported notifications you receive."
              >
                {Object.entries({
                  inApp: [
                    "In-app notifications",
                    "Show notifications inside NextMeet",
                  ],
                  email: [
                    "Email notifications",
                    "Email delivery is not currently implemented",
                  ],
                  meetingReminders: [
                    "Meeting reminders",
                    "Reminder scheduling is not currently implemented",
                  ],
                  joinRequests: [
                    "Join requests",
                    "Notify hosts about incoming join requests",
                  ],
                  interviewReports: [
                    "Interview reports",
                    "Notify when an interview report is published",
                  ],
                  sound: [
                    "Sound",
                    "Sound notifications are not currently implemented",
                  ],
                }).map(([key, [title, description]]) => (
                  <SettingRow key={key} title={title} description={description}>
                    <Toggle
                      checked={
                        settings.notifications[
                          key as keyof Settings["notifications"]
                        ]
                      }
                      onChange={(value) =>
                        update(
                          "notifications",
                          key as keyof Settings["notifications"],
                          value,
                        )
                      }
                      label={title}
                    />
                  </SettingRow>
                ))}
              </SectionCard>
            )}
            {section === "privacy" && (
              <>
                <SectionCard
                  title="Privacy & permissions"
                  description="Review data controls available for your account."
                >
                  <SettingRow
                    title="Account data export"
                    description="Download your user record and saved settings as JSON."
                  >
                    <button
                      type="button"
                      onClick={() => void exportData()}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#dedee8] px-3 py-2 text-xs font-medium text-[#555a73] hover:bg-[#fafafd]"
                    >
                      <Download size={14} />
                      Export data
                    </button>
                  </SettingRow>
                  <SettingRow
                    title="Connected applications"
                    description="No third-party applications are connected to this account."
                  >
                    <span className="text-xs text-[#85899f]">
                      None connected
                    </span>
                  </SettingRow>
                  <SettingRow
                    title="Meeting permissions"
                    description="Host-controlled meeting access is managed per meeting and is not a personal setting."
                  >
                    <span className="text-xs font-medium text-[#5b3fd6]">
                      Managed by hosts
                    </span>
                  </SettingRow>
                </SectionCard>
              </>
            )}
            {section === "appearance" && (
              <SectionCard
                title="Appearance & accessibility"
                description="Adjust the interface for your preferred environment."
              >
                <SettingRow
                  title="Theme"
                  description="Choose the application theme."
                >
                  <div className="flex gap-1 rounded-lg bg-[#f5f4f9] p-1">
                    {(["light", "dark", "system"] as const).map((theme) => (
                      <button
                        key={theme}
                        type="button"
                        onClick={() => {
                          update("appearance", "theme", theme);
                          setThemePreference(theme);
                        }}
                        className={`rounded-md px-3 py-1.5 text-xs capitalize ${settings.appearance.theme === theme ? "bg-white font-semibold text-[#5b3fd6] shadow-sm" : "text-[#777b93]"}`}
                      >
                        {theme === "light" ? (
                          <Sun size={13} className="mr-1 inline" />
                        ) : theme === "dark" ? (
                          <Moon size={13} className="mr-1 inline" />
                        ) : (
                          <Monitor size={13} className="mr-1 inline" />
                        )}
                        {theme}
                      </button>
                    ))}
                  </div>
                </SettingRow>
                <SettingRow
                  title="Language"
                  description="Only English is currently available."
                >
                  <span className="text-sm text-[#555a73]">English</span>
                </SettingRow>
                <SettingRow
                  title="Reduced motion"
                  description="Reduce interface animation where supported."
                >
                  <Toggle
                    checked={settings.appearance.reducedMotion}
                    onChange={(value) =>
                      update("appearance", "reducedMotion", value)
                    }
                    label="Reduced motion"
                  />
                </SettingRow>
                <SettingRow
                  title="Keyboard navigation"
                  description="Keep keyboard focus states visible throughout the interface."
                >
                  <Toggle
                    checked={settings.appearance.keyboardNavigation}
                    onChange={(value) =>
                      update("appearance", "keyboardNavigation", value)
                    }
                    label="Keyboard navigation"
                  />
                </SettingRow>
              </SectionCard>
            )}
            {section !== "security" && (
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={resetSettings}
                  className="rounded-lg border border-[#dedee8] px-4 py-2 text-sm font-medium text-[#555a73]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => void saveSettings()}
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-[#5b3fd6] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
