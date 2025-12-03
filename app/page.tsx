export default function Home() {
  return (
    <div className="container mx-auto px-6 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground text-center">aSTEP</h1>
        <h1 className="text-4xl font-bold text-foreground mb-4 text-center">AAU Spatio-TEmporal data analytics Platform</h1>
        <div className="flex justify-start mt-8">
          <a
            href="/aSTEP.docx"
            download
            className="inline-flex items-center px-4 py-2 text-sm text-muted-foreground border border-border rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download aSTEP Document
          </a>
        </div>
      </div>

      <div className="space-y-8 prose prose-lg dark:prose-invert max-w-none">
        <section>
          <h2 className="text-3xl font-bold text-foreground mb-4">Introduction & Motivation</h2>
          <p className="text-muted-foreground">
            In modern research and education, <strong>spatio-temporal data</strong> has become a cornerstone for understanding complex real-world phenomena—ranging from mobility patterns and urban planning to environmental monitoring and social behaviour analysis. However, managing and analysing such data at scale remains a significant challenge for student projects and collaborative research activities. <br /><br />
          </p>
          <p className="text-muted-foreground">
            <strong>AAU&apos;s Spatio-Temporal Data Analytics Platform (aSTEP)</strong> is established to address this challenge. It serves as a <strong>unified, scalable, and intelligent data management and analytics infrastructure</strong> tailored for <strong>AAU&apos;s student-driven multi-project ecosystem</strong>. The platform provides seamless support for the <strong>processing, storage, and analysis of large-scale spatio-temporal datasets</strong>, acting as a backbone for:
          </p>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li><strong>Data-driven research and innovation</strong></li>
            <li><strong>Cross-disciplinary collaboration</strong></li>
            <li><strong>AI-empowered decision-making and insights</strong></li>
          </ul>
          <p className="text-muted-foreground">
            By integrating advanced data analytics tools with real-world datasets, <strong>aSTEP not only accelerates research productivity but also strengthens hands-on learning, problem-based thinking, and methodological rigor</strong>—fully aligned with the AAU PBL philosophy.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-foreground mb-4">Applications</h2>
          <p className="text-muted-foreground mb-4">
            The <strong>aSTEP</strong> platform supports a wide spectrum of <strong>spatio-temporal and geo-data analytics</strong>, enabling both research and real-world applications across multiple domains. Representative use cases include:
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">🔷 Trajectory Management & Analytics</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Vehicle and vessel trajectory processing</li>
                <li>Mobility pattern mining and route optimisation</li>
                <li>Anomaly detection (e.g., abnormal driving/sailing behaviour)</li>
                <li>Transforming raw GPS coordinates into <strong>semantic geographic information</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">🔷 Time Series & IoT Data Analysis</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Energy consumption forecasting</li>
                <li>Health and behavioural trend analysis</li>
                <li>Environmental and climate monitoring</li>
                <li>Sensor/IoT-based signal modelling and prediction</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">🔷 Spatial Intelligence, Remote Sensing & Urban Analytics</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Land-use and <strong>POI inference from geo-data</strong></li>
                <li>Human behaviour and mobility modelling</li>
                <li>Smart city planning and sustainability analysis</li>
                <li><strong>Integration of satellite, UAV, and remote sensing data</strong></li>
                <li>Geographic pattern extraction from <strong>orbital satellite observations</strong></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-foreground mb-3">🔷 AI + Multi-Modal Data Fusion</h3>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Fusion of <strong>GPS, text, image, sensor, and satellite data</strong></li>
                <li>Foundation models for spatio-temporal and geo-intelligence</li>
                <li>Digital twins and simulated scenario generation</li>
                <li>AI-driven decision support for complex real-world planning</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-foreground mb-4">Contributors</h2>
          <p className="text-muted-foreground mb-4">
            The development and maintenance of <strong>aSTEP</strong> rely on collaborative efforts across multiple groups at AAU. The platform serves as a shared resource for student projects, research prototypes, and cross-disciplinary innovation.
          </p>

          <div>
            <h3 className="text-xl font-semibold text-foreground mb-3">🔷 Core Contributors</h3>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              <li>aSTEP Multi-Project Teams
                <ul className="list-circle pl-6 mt-1">
                  <li>Fall 2025 (sw-5-3, 2, 6, 9, 11)</li>
                </ul>
              </li>
              <li>Data Engineering, Science & Systems (DESS) Group</li>
              <li>Data Section</li>
            </ul>
          </div>
        </section>
      </div>
    </div >
  );
}
