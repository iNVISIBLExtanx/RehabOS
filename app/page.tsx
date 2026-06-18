// Entry point — will render <TabShell /> once components are built
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm max-w-lg w-full text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-4">
          Demo — Synthetic Data Only
        </p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">RehabOS</h1>
        <p className="text-gray-500 text-sm">
          AI Clinical Notes · DB Explorer · WinForms Demo
        </p>
        <p className="mt-6 text-xs text-gray-400">
          Portfolio demo for FunctionAbility Rehabilitation Services
        </p>
      </div>
    </main>
  );
}
