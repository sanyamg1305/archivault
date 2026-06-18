import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Terms of Service – ArchiVault" };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="ArchiVault" width={120} height={40} className="object-contain" />
          </Link>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">← Back to Home</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Terms of Service</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: June 19, 2026</p>
        </div>

        <Section title="1. Acceptance of Terms">
          <p>By creating an account or using ArchiVault ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you are using the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.</p>
          <p>If you do not agree to these Terms, do not use the Service.</p>
        </Section>

        <Section title="2. Description of Service">
          <p>ArchiVault is a project management platform designed for architecture and design studios. It provides tools for managing projects, materials, designs, client collaboration, site visits, document storage, and related workflows.</p>
          <p>The Service is offered as a software-as-a-service (SaaS) product accessible via web browser. Features may change over time as we improve the platform.</p>
        </Section>

        <Section title="3. Accounts & Organisations">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>You must provide accurate information when creating an account.</li>
            <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
            <li>Organisation administrators ("Architects") are responsible for the accounts and actions of members ("Clients" and "Trade Workers") they invite.</li>
            <li>You must be at least 16 years old to use the Service.</li>
            <li>We reserve the right to suspend or terminate accounts that violate these Terms.</li>
          </ul>
        </Section>

        <Section title="4. Acceptable Use">
          <p>You agree not to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Upload content that is illegal, infringing, defamatory, or harmful.</li>
            <li>Attempt to gain unauthorised access to other users' data or accounts.</li>
            <li>Use the Service to transmit spam, malware, or unsolicited communications.</li>
            <li>Reverse-engineer, decompile, or scrape the Service.</li>
            <li>Use the Service in any way that violates applicable laws or regulations.</li>
          </ul>
        </Section>

        <Section title="5. Your Content">
          <p>You retain ownership of all content you upload to ArchiVault ("Your Content"), including project files, designs, photos, and messages.</p>
          <p>By uploading content, you grant ArchiVault a limited, non-exclusive licence to store, process, and display that content solely for the purpose of providing the Service to you.</p>
          <p>You are solely responsible for ensuring Your Content does not violate any third-party intellectual property rights, privacy rights, or applicable laws.</p>
        </Section>

        <Section title="6. Client & Trade Worker Access">
          <p>Architects may invite Clients and Trade Workers to access specific projects. Architects are responsible for managing these permissions and ensuring invitees comply with these Terms.</p>
          <p>Trade Workers log in using phone OTP and have read-only access to project information assigned to them by the Architect.</p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>The ArchiVault platform, including its design, code, branding, and documentation, is owned by ArchiVault and protected by intellectual property laws. These Terms do not grant you any rights to use our trademarks, logos, or brand elements.</p>
        </Section>

        <Section title="8. Privacy">
          <p>Our collection and use of your personal data is described in our <Link href="/privacy" className="text-primary underline underline-offset-2">Privacy Policy</Link>, which is incorporated into these Terms by reference.</p>
        </Section>

        <Section title="9. Availability & Support">
          <p>We aim to keep the Service available at all times but do not guarantee uninterrupted access. We may perform maintenance, upgrades, or experience outages outside our control.</p>
          <p>We provide support on a best-effort basis via email at <a href="mailto:golechhasanyam5@gmail.com" className="text-primary underline underline-offset-2">golechhasanyam5@gmail.com</a>.</p>
        </Section>

        <Section title="10. Disclaimers">
          <p>The Service is provided "as is" without warranties of any kind, express or implied, including fitness for a particular purpose or non-infringement.</p>
          <p>ArchiVault is a project management tool — it does not provide architectural, legal, financial, or any other professional advice. All project decisions remain the responsibility of the relevant professionals and parties.</p>
        </Section>

        <Section title="11. Limitation of Liability">
          <p>To the maximum extent permitted by law, ArchiVault shall not be liable for any indirect, incidental, consequential, or punitive damages arising from your use of the Service, even if we have been advised of the possibility of such damages.</p>
          <p>Our total liability to you for any claim arising under these Terms shall not exceed the amount you paid us in the 12 months preceding the claim (or ₹500 if you have not paid anything).</p>
        </Section>

        <Section title="12. Termination">
          <p>You may delete your account at any time. We may suspend or terminate your access if you violate these Terms, with or without notice.</p>
          <p>On termination, your right to use the Service ceases immediately. Sections 5, 7, 10, 11, and 13 survive termination.</p>
        </Section>

        <Section title="13. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra, India.</p>
        </Section>

        <Section title="14. Changes to These Terms">
          <p>We may update these Terms from time to time. We will notify you of material changes by posting a notice inside the app or by email at least 14 days before the change takes effect. Continued use after that date constitutes acceptance.</p>
        </Section>

        <Section title="15. Contact">
          <p>Questions about these Terms? Email us at <a href="mailto:golechhasanyam5@gmail.com" className="text-primary underline underline-offset-2">golechhasanyam5@gmail.com</a>.</p>
        </Section>
      </main>

      <footer className="border-t mt-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 ArchiVault. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors font-medium text-foreground">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="text-sm text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
