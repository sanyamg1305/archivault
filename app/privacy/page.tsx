import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Privacy Policy – ArchiVault" };

export default function PrivacyPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground mt-2">Last updated: June 19, 2026</p>
        </div>

        <Section title="1. Who We Are">
          <p>ArchiVault ("we", "us", "our") is a project management platform built for architecture and design studios. We are operated by Sanyam Golechha and are based in India. Our service is available at <span className="font-medium">archivault-gray.vercel.app</span>.</p>
          <p>If you have any questions about this policy, contact us at <a href="mailto:golechhasanyam5@gmail.com" className="text-primary underline underline-offset-2">golechhasanyam5@gmail.com</a>.</p>
        </Section>

        <Section title="2. What We Collect">
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Account information</strong> — name, email address, and profile photo provided when you sign up via Clerk.</li>
            <li><strong>Organisation data</strong> — firm name, team members you invite, and roles assigned to them.</li>
            <li><strong>Project content</strong> — designs, materials, documents, photos, chat messages, mood board items, and any other files you upload while using ArchiVault.</li>
            <li><strong>Usage data</strong> — pages visited, actions taken inside the app, and timestamps (stored in our activity log).</li>
            <li><strong>Device & browser data</strong> — IP address, browser type, and operating system, collected automatically by our hosting infrastructure.</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Data">
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To create and manage your account and organisation.</li>
            <li>To deliver the core features of ArchiVault — project tracking, client collaboration, document storage, and notifications.</li>
            <li>To generate audit trails and sign-off documents on your behalf.</li>
            <li>To send you transactional emails (e.g., invitations, OTP codes for trade workers).</li>
            <li>To improve the platform — we analyse aggregate, anonymised usage to understand which features are most useful.</li>
            <li>To comply with legal obligations.</li>
          </ul>
          <p>We do <strong>not</strong> sell your data to third parties. We do <strong>not</strong> use your project content to train AI models.</p>
        </Section>

        <Section title="4. Data Storage & Security">
          <p>Your data is stored on <strong>Supabase</strong> (PostgreSQL database and object storage), hosted on AWS infrastructure in the <strong>ap-south-1 (Mumbai)</strong> region. Authentication is handled by <strong>Clerk</strong>, which is SOC 2 Type II certified.</p>
          <p>Files you upload (designs, photos, documents) are stored in private Supabase storage buckets accessible only via short-lived signed URLs generated at request time.</p>
          <p>We use HTTPS/TLS for all data in transit. Database access from our application uses a service-role key that is never exposed to the browser.</p>
        </Section>

        <Section title="5. Data Sharing">
          <p>We share your data only with the following third-party service providers, strictly to operate the platform:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Clerk</strong> — authentication and user management.</li>
            <li><strong>Supabase</strong> — database and file storage.</li>
            <li><strong>Vercel</strong> — application hosting and edge delivery.</li>
            <li><strong>Twilio / SMS provider</strong> — OTP delivery for trade worker login.</li>
          </ul>
          <p>All providers are bound by data processing agreements and industry-standard security practices.</p>
        </Section>

        <Section title="6. Cookies">
          <p>ArchiVault uses only essential cookies required for authentication (session tokens set by Clerk). We do not use advertising cookies or third-party tracking pixels.</p>
        </Section>

        <Section title="7. Your Rights">
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your account and associated data.</li>
            <li>Export your project data.</li>
          </ul>
          <p>To exercise any of these rights, email us at <a href="mailto:golechhasanyam5@gmail.com" className="text-primary underline underline-offset-2">golechhasanyam5@gmail.com</a>. We will respond within 30 days.</p>
        </Section>

        <Section title="8. Data Retention">
          <p>We retain your data for as long as your account is active. If you delete your account, we will permanently delete your personal data and project content within 30 days, except where we are required by law to retain certain records.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>ArchiVault is not directed at children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us data, contact us and we will delete it promptly.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this policy from time to time. We will notify you of material changes by posting a notice inside the app or by email. Continued use of ArchiVault after the effective date constitutes acceptance of the updated policy.</p>
        </Section>
      </main>

      <footer className="border-t mt-10">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span>© 2026 ArchiVault. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-foreground transition-colors font-medium text-foreground">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
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
