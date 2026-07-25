import { SignUp } from '@clerk/nextjs';

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-600 via-teal-500 to-teal-700 relative overflow-hidden">
      {}
      <div className="absolute top-20 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Join School Funding
          </h1>
          <p className="text-teal-100 mt-1 text-sm">
            Create your account and start making an impact
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'rounded-3xl shadow-2xl shadow-teal-900/30 border border-white/10 backdrop-blur-sm',
              headerTitle: 'text-gray-900 font-bold',
              headerSubtitle: 'text-gray-500',
              formButtonPrimary:
                'bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 rounded-2xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all',
              formFieldInput:
                'rounded-2xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/30',
              footerActionLink: 'text-teal-600 hover:text-teal-700',
              dividerLine: 'bg-gray-200',
              dividerText: 'text-gray-400',
              socialButtonsBlockButton:
                'rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all',
            },
          }}
        />
      </div>
    </div>
  );
}
