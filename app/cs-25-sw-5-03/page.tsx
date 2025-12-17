import Group3Client from "./Group3Client";

export const dynamic = "force-dynamic";

export default function Page() {
    const url = process.env.GROUP3_URL || process.env.NEXT_PUBLIC_GROUP3_URL || "";
    return <Group3Client backendUrl={url} />;
}
