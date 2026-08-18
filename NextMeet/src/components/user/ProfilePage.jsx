import {
  Pencil,
  Camera,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
} from "lucide-react";

const ProfilePage = () => {
  return (
    <section className="p-[30px] px-[38px]">

      {/* Header */}
      <div className="mb-7">
        <h1 className="mb-1 text-[30px] font-bold text-[#171a3a]">
          Profile
        </h1>

        <p className="text-[15px] text-[#656982]">
          Manage your account details and preferences
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-[0.8fr_1.4fr] gap-[26px]">

        {/* Profile Card */}
        <div className="overflow-hidden rounded-xl border border-[#e8e8ef] bg-white">

          {/* Cover */}
          <div className="relative h-[180px] bg-[#f0edff]">

            <button className="absolute right-5 top-5 flex h-10 w-10 items-center justify-center rounded-lg border border-[#ddd9f3] bg-white text-[#4c5273] transition hover:text-[#5b3fd6]">
              <Pencil size={18} />
            </button>

          </div>

          {/* Profile Details */}
          <div className="px-[26px] pb-7 text-center">

            {/* Avatar */}
            <div className="relative mx-auto -mt-[60px] mb-3 h-[120px] w-[120px]">

              <img
                src="https://i.pravatar.cc/200?img=12"
                alt="Anag Anu"
                className="h-[120px] w-[120px] rounded-full border-4 border-white object-cover"
              />

              {/* Change Profile Image */}
              <button className="absolute bottom-1 right-0 flex h-[38px] w-[38px] items-center justify-center rounded-full border-[3px] border-white bg-[#5b3fd6] text-white">
                <Camera size={17} />
              </button>

            </div>

            <h2 className="text-2xl font-bold text-[#191c40]">
              Anag Anu
            </h2>

            <p className="mt-1 text-[#686d88]">
              Full Stack Developer
            </p>

            {/* Online */}
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full bg-[#eafaf0] px-3 py-1.5 text-[13px] text-green-600">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Online
            </div>

            <div className="my-6 h-px bg-[#e9e9ef]" />

            {/* Information */}
            <div className="flex flex-col gap-5 text-left">

              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <Mail size={19} className="text-[#646b91]" />
                <span>anag.anu@example.com</span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <Phone size={19} className="text-[#646b91]" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <MapPin size={19} className="text-[#646b91]" />
                <span>Kannur, Kerala, India</span>
              </div>

              <div className="flex items-center gap-3.5 text-sm text-[#3f435d]">
                <CalendarDays size={19} className="text-[#646b91]" />
                <span>Joined August 2025</span>
              </div>

            </div>

          </div>

        </div>

        {/* Edit Profile Form */}
        <div className="rounded-xl border border-[#e8e8ef] bg-white p-[25px]">

          {/* Form Header */}
          <div className="mb-6 flex items-center justify-between">

            <h2 className="text-[19px] font-bold text-[#191c40]">
              Edit Profile Details
            </h2>

            {/* Edit Icon Top Right */}
            <button
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#dedee8] bg-white text-[#555b79] transition hover:border-[#cfc5ff] hover:text-[#5b3fd6]"
              title="Edit profile"
            >
              <Pencil size={18} />
            </button>

          </div>

          <form className="flex flex-col gap-5">

            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-5">

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">
                  Full Name
                </label>

                <input
                  type="text"
                  value="Anag Anu"
                  readOnly
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">
                  Username
                </label>

                <input
                  type="text"
                  value="anag_anu"
                  readOnly
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
                />
              </div>

            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-5">

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">
                  Email
                </label>

                <input
                  type="email"
                  value="anag.anu@example.com"
                  readOnly
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">
                  Location
                </label>

                <input
                  type="text"
                  value="Kannur, Kerala, India"
                  readOnly
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
                />
              </div>

            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-2 gap-5">

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">
                  Phone
                </label>

                <input
                  type="text"
                  value="+91 98765 43210"
                  readOnly
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[13px] font-medium text-[#4d526d]">
                  Profession
                </label>

                <input
                  type="text"
                  value="Full Stack Developer"
                  readOnly
                  className="w-full rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
                />
              </div>

            </div>

            {/* Bio */}
            <div className="flex flex-col gap-2">

              <label className="text-[13px] font-medium text-[#4d526d]">
                Bio
              </label>

              <textarea
                value="Full Stack Developer passionate about building amazing web applications."
                readOnly
                className="min-h-[130px] w-full resize-y rounded-lg border border-[#dedee8] px-[13px] py-3 text-sm text-[#30344f] outline-none"
              />

            </div>

            {/* Save */}
            <div className="mt-1 flex justify-end">

              <button
                type="button"
                className="rounded-lg bg-[#5b3fd6] px-5 py-3 text-sm text-white transition hover:bg-[#4d32c5]"
              >
                Save Changes
              </button>

            </div>

          </form>

        </div>

      </div>

    </section>
  );
};

export default ProfilePage;