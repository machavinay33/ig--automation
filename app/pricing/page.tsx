import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h1 className="text-4xl font-extrabold">Simple, honest pricing</h1>
          <p className="mt-4 text-gray-600">
            One plan. Every feature included. Start with a free day, no card required to try it.
          </p>
        </section>

        <section className="mx-auto max-w-md px-6 pb-24">
          <div className="card border-2 border-brand-500/40 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
              Pro Plan
            </p>
            <p className="mt-4 text-5xl font-extrabold">
              ₹5<span className="text-lg font-medium text-gray-500">/month</span>
            </p>
            <p className="mt-2 text-gray-500">First 24 hours free</p>

            <ul className="mt-8 space-y-3 text-left text-gray-700">
              {[
                "Unlimited auto-reply rules",
                "Connect multiple Instagram accounts",
                "Keyword-based comment matching",
                "Full comment & reply activity log",
                "Cancel anytime",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-0.5 text-brand-500">✓</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href="/signup" className="btn-primary mt-8 w-full">
              Start free trial
            </Link>
            <p className="mt-3 text-xs text-gray-400">
              Billing starts automatically after your free day unless you cancel.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24">
          <h2 className="mb-6 text-center text-2xl font-bold">FAQ</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Do I need a credit card to start the trial?</h3>
              <p className="text-gray-600">
                No — you can explore the dashboard for free for 24 hours. You'll be prompted to
                subscribe for ₹5/month to keep automation running afterward.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes, cancel from your dashboard at any time — no long-term contracts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Which Instagram accounts can I connect?</h3>
              <p className="text-gray-600">
                Instagram Business or Creator accounts linked to a Facebook Page, as required by
                Meta's Instagram Graph API.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
