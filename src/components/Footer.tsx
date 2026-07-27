export function Footer() {
  return (
    <footer className="border-t border-gray-200/50 dark:border-gray-800/50 mt-auto">
      <div className="max-w-5xl mx-auto px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Built with ❤️ using free AI &mdash;{" "}
          <a
            href="https://github.com/Divya13122002/ai-text-humanizer"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-indigo-500 transition-colors"
          >
            View on GitHub
          </a>
        </p>
      </div>
    </footer>
  );
}
