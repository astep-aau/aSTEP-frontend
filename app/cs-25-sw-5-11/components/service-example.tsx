interface ServiceExampleProps {
  testData?: Promise<string>
}

export function ServiceExample({ testData }: ServiceExampleProps) {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-foreground mb-4">Group 11: Travel Time Estimation</h1>
      <p className="text-lg text-muted-foreground">
        Interactive map showing...
      </p>
      <p>Test microservice request:</p>
      {testData}
    </div>
  )
}
