export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-gray-500">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} ReplyBee. Not affiliated with Meta or Instagram.</p>
          <div className="flex gap-6">
            <a href="/pricing" className="hover:text-gray-800">Pricing</a>
            <a href="/login" className="hover:text-gray-800">Log in</a>
            <a href="/signup" className="hover:text-gray-800">Sign up</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
