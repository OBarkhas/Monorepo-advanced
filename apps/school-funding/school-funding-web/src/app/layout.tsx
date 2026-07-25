import type { Metadata } from 'next';
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import { Toaster } from 'sonner';
import './global.css';
import { ClerkApolloProvider } from './components/ApolloProvider';
import { SimpleNavigation } from './components/Sidebar';
import { RoleRedirect } from './components/RoleRedirect';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'School Funding Platform',
  description: 'Vote and fund student projects with coins',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-teal-50/40 via-white to-emerald-50/30 min-h-screen`}
        >
          <ClerkApolloProvider>
            <RoleRedirect />

            <header className="flex justify-end items-center p-4 gap-4 h-16 bg-white/70 backdrop-blur-md border-b border-teal-100/50 sticky top-0 z-50 shadow-sm">
              <Show when="signed-out">
                <SignInButton>
                  <button className="px-5 py-2 text-sm font-medium text-teal-700 hover:text-teal-900 border border-teal-200 rounded-2xl hover:bg-teal-50 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]">
                    Sign In
                  </button>
                </SignInButton>

                <SignUpButton>
                  <button className="bg-gradient-to-r from-teal-600 to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white rounded-2xl font-medium text-sm sm:text-base h-10 sm:h-12 px-5 sm:px-6 cursor-pointer shadow-md hover:shadow-lg hover:shadow-teal-200/50 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    Sign Up
                  </button>
                </SignUpButton>
              </Show>

              <Show when="signed-in">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-teal-600 font-medium hidden sm:block">
                    Dashboard
                  </span>
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox:
                          'w-9 h-9 rounded-2xl border-2 border-teal-200',
                      },
                    }}
                  />
                </div>
                <SimpleNavigation />
              </Show>
            </header>

            <main className="ml-0 sm:ml-64 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </ClerkApolloProvider>

          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                borderRadius: '16px',
                padding: '16px',
              },
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
