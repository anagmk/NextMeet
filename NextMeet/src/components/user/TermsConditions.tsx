import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Phone } from "lucide-react";

const TermsConditions = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8f8fc]">
      {/* Header */}
      <header className="border-b border-[#e8e8ef] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-xl font-bold text-[#171a3a]">
              Terms & Conditions
            </h1>

            <p className="mt-1 text-xs text-[#777b93]">
              Last updated: September 11, 2026
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#5b3fd6] transition hover:bg-[#eeeaff]"
          >
            <ArrowLeft size={17} />
            Back
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-[#e8e8ef] bg-white p-6 shadow-[0_8px_30px_rgba(35,31,65,0.05)] sm:p-10">

          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-[#171a3a]">
              Terms & Conditions
            </h2>

            <p className="mt-4 text-sm leading-7 text-[#656982]">
              Welcome to NextMeet. These Terms & Conditions govern your
              access to and use of the NextMeet website, application,
              meeting services, and related features. By creating an
              account or using NextMeet, you agree to be bound by these
              Terms & Conditions.
            </p>

            <p className="mt-4 text-sm leading-7 text-[#656982]">
              Please read these terms carefully before using the service.
              If you do not agree with these terms, you should not use
              NextMeet.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 1. Use of NextMeet */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              1. Use of NextMeet
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              NextMeet provides online meeting and communication
              functionality that allows users to create, schedule, join,
              and participate in virtual meetings.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You agree to use NextMeet only for lawful purposes and in
              accordance with these Terms & Conditions. You must not use
              the service for activities that violate applicable laws or
              regulations.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 2. Account Registration */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              2. Account Registration
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Some NextMeet features require you to create an account.
              When registering, you agree to provide accurate and
              up-to-date information.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You are responsible for maintaining the confidentiality of
              your account credentials and for all activities performed
              through your account.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You should notify us promptly if you believe that your
              account has been accessed or used without authorization.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 3. Meetings and User Content */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              3. Meetings and User Content
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Users may create meetings, invite participants, communicate
              with other users, and submit content through NextMeet.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You are responsible for the content and information that
              you submit, upload, transmit, or share through the service.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You must not use NextMeet to distribute unlawful,
              fraudulent, abusive, threatening, defamatory, harmful, or
              otherwise inappropriate content.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You must also respect the privacy and rights of other
              meeting participants.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 4. Intellectual Property */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              4. Intellectual Property
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              The NextMeet website, software, design, branding, logos,
              graphics, interfaces, text, and other materials provided by
              NextMeet are protected by applicable intellectual property
              laws.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You may not copy, modify, reproduce, distribute, sell,
              reverse engineer, or create derivative works from any part
              of NextMeet without prior written permission.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 5. Prohibited Activities */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              5. Prohibited Activities
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You agree not to:
            </p>

            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-[#656982]">
              <li>
                Use NextMeet for illegal or unauthorized purposes.
              </li>

              <li>
                Attempt to gain unauthorized access to accounts,
                meetings, systems, or infrastructure.
              </li>

              <li>
                Interfere with or disrupt the operation of the service.
              </li>

              <li>
                Upload malicious software, viruses, or harmful code.
              </li>

              <li>
                Impersonate another person or organization.
              </li>

              <li>
                Abuse, harass, threaten, or harm other users.
              </li>

              <li>
                Attempt to bypass security or authentication mechanisms.
              </li>

              <li>
                Scrape, copy, or systematically collect information from
                the service without authorization.
              </li>
            </ul>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 6. Privacy */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              6. Privacy and Personal Information
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              NextMeet may collect and process information necessary to
              provide and improve the service, including account
              information, meeting information, and technical information.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Our collection and use of personal information is governed
              by our Privacy Policy. By using NextMeet, you acknowledge
              that you have reviewed the applicable privacy practices.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 7. Third-Party Services */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              7. Third-Party Services
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              NextMeet may use third-party services to provide certain
              functionality, including hosting, authentication, email
              delivery, analytics, storage, communication, payment
              processing, or other technical services.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Third-party services may have their own terms and privacy
              policies. NextMeet is not responsible for the independent
              policies or practices of third-party providers.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 8. Service Availability */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              8. Service Availability
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              We aim to keep NextMeet available and functional, but we do
              not guarantee that the service will always be available,
              uninterrupted, secure, or error-free.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Service availability may be affected by maintenance,
              technical failures, network problems, third-party services,
              security incidents, or circumstances outside our reasonable
              control.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 9. Internet and Network Charges */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              9. Internet and Network Charges
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Using NextMeet requires an internet connection. You are
              responsible for any internet, mobile data, roaming, or
              other network charges imposed by your internet or mobile
              service provider.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 10. Disclaimer */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              10. Disclaimer
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              NextMeet is provided on an "as is" and "as available" basis
              to the extent permitted by applicable law.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              We do not guarantee that the service will meet every
              individual requirement or that all features will operate
              without interruption or errors.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 11. Limitation of Liability */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              11. Limitation of Liability
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              To the maximum extent permitted by applicable law, NextMeet
              and its operators shall not be liable for indirect,
              incidental, consequential, special, or other damages
              resulting from your use of or inability to use the service.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 12. Suspension and Termination */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              12. Suspension and Termination
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              We may suspend or terminate an account or restrict access to
              NextMeet where we reasonably believe that a user has
              violated these Terms, applicable laws, or has otherwise
              misused the service.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              You may stop using NextMeet at any time and may request
              deletion of your account where supported by the service.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 13. Changes */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              13. Changes to These Terms
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              We may update these Terms & Conditions from time to time.
              When changes are made, the updated version will be published
              on this page with a revised effective date.
            </p>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              Your continued use of NextMeet after the updated terms are
              published constitutes acceptance of the revised terms, to
              the extent permitted by applicable law.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 14. Governing Law */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              14. Governing Law
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              These Terms shall be governed by and interpreted in
              accordance with the applicable laws of the jurisdiction in
              which the NextMeet service operator is established, unless
              otherwise required by applicable law.
            </p>
          </section>

          <div className="my-8 border-t border-[#eeeef4]" />

          {/* 15. Contact Us */}
          <section>
            <h2 className="text-lg font-bold text-[#171a3a]">
              15. Contact Us
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#656982]">
              If you have any questions, concerns, suggestions, or require
              assistance regarding NextMeet or these Terms & Conditions,
              you can contact us using the information below.
            </p>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">

              {/* Email */}
              <a
                href="mailto:mkanag40@gmail.com"
                className="group rounded-xl border border-[#eeeef4] bg-[#fafafd] p-4 transition hover:border-[#dcd6ff] hover:bg-[#f7f5ff]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eeeaff] text-[#5b3fd6]">
                  <Mail size={17} />
                </div>

                <p className="mt-3 text-xs font-medium text-[#777b93]">
                  Email
                </p>

                <p className="mt-1 break-all text-sm font-medium text-[#5b3fd6]">
                  mkanag40@gmail.com
                </p>
              </a>

              {/* Phone */}
              <a
                href="tel:+919847205968"
                className="group rounded-xl border border-[#eeeef4] bg-[#fafafd] p-4 transition hover:border-[#dcd6ff] hover:bg-[#f7f5ff]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eeeaff] text-[#5b3fd6]">
                  <Phone size={17} />
                </div>

                <p className="mt-3 text-xs font-medium text-[#777b93]">
                  Phone
                </p>

                <p className="mt-1 text-sm font-medium text-[#5b3fd6]">
                  +91 98472 05968
                </p>
              </a>

              {/* Website */}
              <a
                href="https://nextmeet.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-xl border border-[#eeeef4] bg-[#fafafd] p-4 transition hover:border-[#dcd6ff] hover:bg-[#f7f5ff]"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eeeaff] text-[#5b3fd6]">
                  <Mail size={17} />
                </div>

                <p className="mt-3 text-xs font-medium text-[#777b93]">
                  Website
                </p>

                <p className="mt-1 text-sm font-medium text-[#5b3fd6]">
                  nextmeet.app
                </p>
              </a>

            </div>
          </section>

          {/* Effective Date */}
          <div className="mt-10 rounded-xl bg-[#f6f4ff] px-5 py-4">
            <p className="text-xs text-[#656982]">
              <span className="font-semibold text-[#343850]">
                Effective Date:
              </span>{" "}
              September 11, 2026
            </p>
          </div>

        </div>
      </main>
    </div>
  );
};

export default TermsConditions;