import { GroupCard } from "@/components/group-card"

export default function Home() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground text-center">aSTEP</h1>
        <h1 className="text-4xl font-bold text-foreground mb-4 text-center">AAU Spatio-TEmporal data analytics Platform</h1>
        <p className="text-lg text-muted-foreground">
          Discover what each group is working on in the aSTEP platform.
        </p>
      </div>

      <div className="space-y-8">
        <GroupCard 
          title="Group 2: Forecasting"
          description="Description"
          focusAreas={[
            "Focus Area 1",
            "Focus Area 2", 
            "Focus Area 3",
            "..."
          ]}
          technologies="Fancy words, such as BIG DATA, MACHINE LEARNING, BLOCKCHAIN https://www.youtube.com/watch?v=X0x5W15alfo&t=653s"
        />

        <GroupCard 
          title="Group 3: Travel Time Estimation"
          description="Description"
          focusAreas={[
            "Focus Area 1",
            "Focus Area 2", 
            "Focus Area 3",
            "..."
          ]}
          technologies="Fancy words, such as BIG DATA, MACHINE LEARNING, BLOCKCHAIN, https://www.youtube.com/watch?v=X0x5W15alfo&t=653s"
        />


        <GroupCard 
          title="Group 6: Attributes Prediction"
          description="Description"
          focusAreas={[
            "Focus Area 1",
            "Focus Area 2", 
            "Focus Area 3",
            "..."
          ]}
          technologies="Fancy words, such as BIG DATA, MACHINE LEARNING, BLOCKCHAIN, https://www.youtube.com/watch?v=X0x5W15alfo&t=653s"
        />


        <GroupCard 
          title="Group 9: Outlier Detection"
          description="Description"
          focusAreas={[
            "Focus Area 1",
            "Focus Area 2", 
            "Focus Area 3",
            "..."
          ]}
          technologies="Fancy words, such as BIG DATA, MACHINE LEARNING, BLOCKCHAIN, https://www.youtube.com/watch?v=X0x5W15alfo&t=653s"
        />

        <GroupCard 
          title="Group 11: Travel Time Estimation"
          description="Description"
          focusAreas={[
            "Focus Area 1",
            "Focus Area 2", 
            "Focus Area 3",
            "..."
          ]}
          technologies="Fancy words, such as BIG DATA, MACHINE LEARNING, BLOCKCHAIN, https://www.youtube.com/watch?v=X0x5W15alfo&t=653s"
        />

        {/* Super Groups */}
        <div className="border-t pt-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">Super Group Organization</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Trajectory Super Group */}
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-semibold text-foreground mb-2">Trajectory Super Group</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Supervisor:</span> Sean Bin Yang
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Groups:</span> 3, 6, 11
              </p>
              <p className="text-muted-foreground">
                Focuses on spatial-temporal trajectory analysis, routing optimization, and transportation applications. 
              </p>
            </div>

            {/* Time Series Super Group */}
            <div className="border rounded-lg p-6 bg-card">
              <h3 className="text-xl font-semibold text-foreground mb-2">Time Series Super Group</h3>
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium">Supervisors:</span> Anders & Jonas
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">Groups:</span> 2, 9
              </p>
              <p className="text-muted-foreground">
                Concentrates on temporal data analysis, forecasting, and outlier detection. 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
