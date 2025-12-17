import Navbar from './Navbar';

export default function TimeSeriesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-background min-h-screen">
            <Navbar />
            <main>{children}</main>
        </div>
    );
}
