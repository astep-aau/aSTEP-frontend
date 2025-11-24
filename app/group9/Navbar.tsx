"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();
    
    const navItems = [
        { name: 'My Dataset', href: '/group9/MyDataset' },
        { name: 'Upload Data', href: '/group9/Upload' },
    ];

    const inactiveClass = "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors duration-150";
    const activeClass = "text-gray-900 dark:text-white font-semibold border-b-2 border-blue-600 dark:border-blue-400";

    return (
        <nav className="bg-white dark:bg-gray-950 shadow dark:shadow-2xl border-b border-gray-200 dark:border-gray-800">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center space-x-8">
                        <span className="text-xl font-bold text-blue-600 dark:text-blue-400">aSTEP Time Series</span>
                        
                        {/* Navigation Links */}
                        <div className="hidden sm:flex space-x-6">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`py-2 text-lg focus:outline-none ${
                                        pathname === item.href ? activeClass : inactiveClass
                                    }`}
                                >
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}