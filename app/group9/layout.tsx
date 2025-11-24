import Navbar from './Navbar';

export default function Group9Layout({
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
