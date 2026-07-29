import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    title: "Keyword-based rules",
    desc: "Reply automatically when a comment contains words like \"price\", \"link\", or \"DM\" — you decide the triggers.",
  },
  {
    title: "Multiple Instagram accounts",
    desc: "Connect and manage auto-replies across several Instagram Business/Creator accounts from one dashboard.",
  },
  {
    title: "Full activity log",
    desc: "See every comment received, which rule matched, and what reply was sent — nothing happens silently.",
  },
  {
    title: "Safe by design",
    desc: "Automation only runs while your subscription is active, so you're always in control of what's live.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 text-center sm:pt-24">
          <span className="mb-6 inline-block rounded-full bg-brand-100 px-4 py-1 text-sm font-medium text-brand-600">
            1 day free trial · then just ₹5/month
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
            Never miss a comment on your{" "}
            <span className="bg-ig-gradient bg-clip-text text-transparent">Instagram</span> posts
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            ReplyBee watches your Instagram posts and automatically replies to comments the moment
            they come in — based on keyword rules you set. Perfect for FAQs, giveaways, and lead capture.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary">Start your free day →</Link>
            <Link href="/pricing" className="btn-secondary">See pricing</Link>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-24">
          <h2 className="mb-10 text-center text-3xl font-bold">Built for creators and small brands</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="card">
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-6xl px-6">
            <h2 className="mb-10 text-center text-3xl font-bold">How it works</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                ["1. Connect Instagram", "Link your Instagram Business/Creator account securely."],
                ["2. Set your rules", "Choose keywords and write the reply you want sent automatically."],
                ["3. Sit back", "Comments matching your rules get replied to instantly, 24/7."],
              ].map(([title, desc]) => (
                <div key={title} className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-ig-gradient text-lg font-bold text-white">
                    {title[0]}
                  </div>
                  <h3 className="mb-2 font-semibold">{title}</h3>
                  <p className="text-gray-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h2 className="mb-4 text-3xl font-bold">Try it free for a day</h2>
          <p className="mb-8 text-gray-600">
            No commitment — cancel anytime. After your free day, it's just ₹5/month.
          </p>
          <Link href="/signup" className="btn-primary">Create your account</Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
