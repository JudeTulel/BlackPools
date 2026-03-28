import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">BP</span>
              </div>
              <h1 className="text-xl font-bold text-white">Black Pools</h1>
            </div>
            <nav className="hidden md:flex gap-8">
              <a href="#features" className="text-slate-300 hover:text-white transition">
                Features
              </a>
              <a href="#how-it-works" className="text-slate-300 hover:text-white transition">
                How It Works
              </a>
              <a href="#docs" className="text-slate-300 hover:text-white transition">
                Docs
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
          Confidential DeFi Lending
        </h2>
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          Black Pools is a fully homomorphic encryption powered lending protocol built on Fhenix CoFHE.
          All positions remain encrypted on-chain — neither amounts nor ratios are visible to any observer.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/vaults"
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            Launch App
          </Link>
          <a
            href="https://github.com/fhenixprotocol"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-slate-400 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-semibold transition"
          >
            GitHub
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Key Features</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="card">
            <div className="text-3xl mb-4">🔐</div>
            <h4 className="text-xl font-bold text-white mb-2">Full Privacy</h4>
            <p className="text-slate-300">
              All supply shares, borrow shares, and collateral remain encrypted on-chain using FHE.
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-4">🎯</div>
            <h4 className="text-xl font-bold text-white mb-2">Isolated Markets</h4>
            <p className="text-slate-300">
              Permissionless market creation with independent liquidity pools. One exploit cannot affect others.
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-4">⚡</div>
            <h4 className="text-xl font-bold text-white mb-2">O(1) Interest Accrual</h4>
            <p className="text-slate-300">
              Share-based accounting enables interest accrual in constant time regardless of user count.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">How It Works</h3>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Supply & Earn</h4>
            <p className="text-slate-300 mb-4">
              Supply loan tokens and receive encrypted supply shares. Interest accrues automatically as each share becomes worth more over time.
            </p>
            <ul className="space-y-2 text-slate-300">
              <li>✓ Encrypted share tracking</li>
              <li>✓ Automatic interest accrual</li>
              <li>✓ Local balance decryption</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold text-white mb-4">Borrow Against Collateral</h4>
            <p className="text-slate-300 mb-4">
              Post collateral and borrow loan tokens. Collateral sufficiency checks happen entirely in FHE — no values are revealed.
            </p>
            <ul className="space-y-2 text-slate-300">
              <li>✓ Encrypted collateral tracking</li>
              <li>✓ FHE-based health checks</li>
              <li>✓ Branchless liquidation logic</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h3 className="text-3xl font-bold text-white mb-12 text-center">Built With</h3>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-2xl mb-2">🔗</div>
            <p className="font-semibold text-white">Fhenix CoFHE</p>
            <p className="text-sm text-slate-400">FHE Infrastructure</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">🏗️</div>
            <p className="font-semibold text-white">Morpho Architecture</p>
            <p className="text-sm text-slate-400">Isolated Markets</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">⚙️</div>
            <p className="font-semibold text-white">Solidity</p>
            <p className="text-sm text-slate-400">Smart Contracts</p>
          </div>
          <div className="card text-center">
            <div className="text-2xl mb-2">⚛️</div>
            <p className="font-semibold text-white">Next.js</p>
            <p className="text-sm text-slate-400">Frontend</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h3 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h3>
        <p className="text-xl text-slate-300 mb-8">
          Connect your wallet and start lending with full privacy.
        </p>
        <Link
          href="/vaults"
          className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition"
        >
          Launch App
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>Black Pools v1.2.0 — Confidential DeFi Lending on Fhenix CoFHE</p>
          <p className="mt-2 text-sm">
            Built with ❤️ by the Fhenix community
          </p>
        </div>
      </footer>
    </main>
  );
}
