import React from 'react';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

export default function Layout({ children, currentPageName }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <main className="flex-grow">
                {children}
            </main>

            <Footer />
        </div>
    );
}