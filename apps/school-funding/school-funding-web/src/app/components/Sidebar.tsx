'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Plus, Podium, Search, User } from 'lucide-react';

export function SimpleNavigation() {
  const pathname = usePathname();

  const links = [
    { name: 'HomePage', href: '/', icon: LayoutDashboard },
    { name: 'CreateProject', href: '/create-project', icon: Plus },
    { name: 'Leaderboard', href: '/leaderboard', icon: Podium },
    { name: 'SearchUser', href: '/search-user', icon: Search },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-gray-900 border-r border-gray-800 p-6">
      <nav className="flex flex-col gap-2 mt-8">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
