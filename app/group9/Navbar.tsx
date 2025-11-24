"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

export default function Navbar() {
    const pathname = usePathname();
    
    const navItems = [
        { name: 'My Datasets', href: '/group9/MyDataset' },
        { name: 'Upload Data', href: '/group9/Upload' },
    ];

    return (
        <>
            <nav className="bg-card border-b border-border">
                <div className="container mx-auto px-6 max-w-6xl">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-8">
                            <span className="text-lg font-bold text-foreground">aSTEP Time Series</span>
                            
                            {/* Navigation Links */}
                            <div className="hidden sm:flex space-x-6">
                                {navItems.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`py-2 text-sm font-medium transition-colors duration-150 ${
                                                isActive 
                                                    ? 'text-foreground border-b-2 border-primary' 
                                                    : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
            <Separator />
        </>
    );
}