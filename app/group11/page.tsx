import { Map } from "@/components/map";

export default function Group11Page() {
  const markers = [
    {
      position: [45.755536, 126.636858] as [number, number],
      title: "Harbin",
      description: "Harbin, China"
    },
  ];

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">Group 11: Travel Time Estimation</h1>
        <p className="text-lg text-muted-foreground">
          Interactive map showing...
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Harbin, China</h2>
        <Map 
          center={[45.7536, 126.6625]}
          zoom={14}
          markers={markers}
          className="h-[600px] w-full rounded-lg border"
        />
      </div>

    </div>
  );
}
