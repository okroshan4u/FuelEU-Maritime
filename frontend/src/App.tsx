import React, { useState, useEffect } from 'react';
import { Ship, TrendingDown, Database, Users, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from "react-toastify";


// Type Definitions
interface Route {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number;
  fuelConsumption: number;
  distance: number;
  totalEmissions: number;
  isBaseline: boolean;
}

interface PoolMember {
  ship: string;
  cbBefore: number;
  cbAfter: number;
}

const FuelEUDashboard = () => {
  const [activeTab, setActiveTab] = useState<string>('routes');
  const [routes, setRoutes] = useState<Route[]>([]);
  const [baseline, setBaseline] = useState<Route | null>(null);


  const [loading, setLoading] = useState<boolean>(false);
  const [comparison, setComparison] = useState<any[]>([]);
  const [cbData, setCbData] = useState<any>(null);
  const [poolMembers, setPoolMembers] = useState<any[]>([]);

  const [filterVessel, setFilterVessel] = useState<string>("All");
  const [filterFuel, setFilterFuel] = useState<string>("All");
  const [filterYear, setFilterYear] = useState<string>("All");

  // Mock data for demonstration
  const mockRoutes: Route[] = [
    { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: false },
    { routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
    { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false },
    { routeId: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, isBaseline: false },
    { routeId: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, isBaseline: false }
  ];

  // useEffect(() => {
  //   setRoutes(mockRoutes);
  // }, []);
  // const fetchRoutes = () => {
  //   fetch("http://localhost:4000/api/routes")
  //     .then((res) => res.json())
  //     .then((data) => setRoutes(data))
  //     .catch((err) => console.error("Error fetching routes:", err));
  // };
  const fetchRoutes = () => {
    const params = new URLSearchParams();

    if (filterVessel !== "All") params.append("vesselType", filterVessel);
    if (filterFuel !== "All") params.append("fuelType", filterFuel);
    if (filterYear !== "All") params.append("year", filterYear);

    fetch(`http://localhost:4000/api/routes?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setRoutes(data))
      .catch((err) => console.error("Error fetching routes:", err));
  };


  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    if (activeTab === "compare") {
      fetch("http://localhost:4000/api/compare")
        .then((res) => res.json())
        .then((data) => {
          setBaseline(data.baseline);
          setComparison(data.comparison);
        })
        .catch((err) => console.error("Error fetching comparison:", err));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "banking") {
      fetch("http://localhost:4000/api/bank/cb")
        .then((res) => res.json())
        .then((data) => setCbData(data))
        .catch((err) => console.error("Error fetching CB:", err));
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "pooling") {
      fetch("http://localhost:4000/api/pool/members")
        .then((res) => res.json())
        .then((data) => setPoolMembers(data))
        .catch((err) => console.error("Error fetching pool members:", err));
    }
  }, [activeTab]);



  // const setAsBaseline = (routeId: string): void => {
  //   setRoutes(routes.map(r => ({
  //     ...r,
  //     isBaseline: r.routeId === routeId
  //   })));
  //   const baselineRoute = routes.find(r => r.routeId === routeId);
  //   setBaseline(baselineRoute || null);
  // };
  const setAsBaseline = (routeId: string): void => {
    fetch(`http://localhost:4000/api/baseline/${routeId}`, { method: "POST" })
      .then(() => fetchRoutes());
  };

  const calculateCompliance = (ghgIntensity: number): boolean => {
    const target = 89.3368; // 2% below 91.16
    return ghgIntensity <= target;
  };

  const calculatePercentDiff = (comparison: number, baseline: number): number => {
    if (!baseline) return 0;
    return ((comparison / baseline) - 1) * 100;
  };

  interface TabButtonProps {
    id: string;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
  }

  const TabButton: React.FC<TabButtonProps> = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === id
        ? 'bg-blue-600 text-white border-b-2 border-blue-600'
        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
    >
      <Icon size={20} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Ship size={32} />
            <h1 className="text-3xl font-bold">FuelEU Maritime Compliance Platform</h1>
          </div>
          <p className="text-blue-100">Hexagonal Architecture | Full-Stack Implementation</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto flex gap-1">
          <TabButton id="routes" label="Routes" icon={Ship} />
          <TabButton id="compare" label="Compare" icon={TrendingDown} />
          <TabButton id="banking" label="Banking" icon={Database} />
          <TabButton id="pooling" label="Pooling" icon={Users} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'routes' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Route Management</h2>

            {/* Filters */}
            {/* <div className="grid grid-cols-3 gap-4 mb-6"> */}
            {/* <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>All Vessel Types</option>
                <option>Container</option>
                <option>BulkCarrier</option>
                <option>Tanker</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>All Fuel Types</option>
                <option>HFO</option>
                <option>LNG</option>
                <option>MGO</option>
              </select>
              <select className="border border-gray-300 rounded-lg px-4 py-2">
                <option>All Years</option>
                <option>2024</option>
                <option>2025</option>
              </select> */}
            {/* <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filterVessel}
                onChange={(e) => {
                  setFilterVessel(e.target.value);
                  fetchRoutes();
                }}
              >
                <option>All</option>
                <option>Container</option>
                <option>BulkCarrier</option>
                <option>Tanker</option>
                <option>RoRo</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filterFuel}
                onChange={(e) => {
                  setFilterFuel(e.target.value);
                  fetchRoutes();
                }}
              >
                <option>All</option>
                <option>HFO</option>
                <option>LNG</option>
                <option>MGO</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filterYear}
                onChange={(e) => {
                  setFilterYear(e.target.value);
                  fetchRoutes();
                }}
              >
                <option>All</option>
                <option>2024</option>
                <option>2025</option>
              </select>

            </div> */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filterVessel}
                onChange={(e) => setFilterVessel(e.target.value)}
              >
                <option value="All">All Vessel Types</option>
                <option value="Container">Container</option>
                <option value="BulkCarrier">BulkCarrier</option>
                <option value="Tanker">Tanker</option>
                <option value="RoRo">RoRo</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filterFuel}
                onChange={(e) => setFilterFuel(e.target.value)}
              >
                <option value="All">All Fuel Types</option>
                <option value="HFO">HFO</option>
                <option value="LNG">LNG</option>
                <option value="MGO">MGO</option>
              </select>

              <select
                className="border border-gray-300 rounded-lg px-4 py-2"
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="All">All Years</option>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
              </select>
            </div>

            <div>
              <button
                className="bg-blue-600 text-white px-4 py-2 my-2 cursor-pointer rounded-lg font-medium hover:bg-blue-700 transition-all"
                onClick={fetchRoutes}
              >
                Apply Filters
              </button>

              <button
                className="bg-gray-200 text-gray-800 px-4 py-2 my-2 cursor-pointer rounded-lg font-medium hover:bg-gray-300 transition-all ml-2"
                onClick={() => {
                  setFilterVessel("All");
                  setFilterFuel("All");
                  setFilterYear("All");
                  fetchRoutes();
                }}
              >
                Reset
              </button>
            </div>


            {/* Routes Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Route ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Vessel Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fuel Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Year</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GHG Intensity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Consumption (t)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Distance (km)</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {routes.map((route) => (
                    <tr key={route.routeId} className={route.isBaseline ? 'bg-blue-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.routeId}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{route.vesselType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{route.fuelType}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{route.year}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{route.ghgIntensity} gCO₂e/MJ</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{route.fuelConsumption}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{route.distance}</td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          // onClick={() => setAsBaseline(route.routeId)}
                          onClick={() => {
                            fetch(`http://localhost:4000/api/baseline/${route.routeId}`, {
                              method: "POST",
                            }).then(() => fetchRoutes());
                          }}

                          disabled={route.isBaseline}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${route.isBaseline
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                          {route.isBaseline ? 'Baseline ✓' : 'Set Baseline'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'compare' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Baseline Comparison</h2>

            {baseline ? (
              <div>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <h3 className="font-semibold text-lg mb-2">Baseline Route: {baseline.routeId}</h3>
                  <p className="text-gray-700">GHG Intensity: {baseline.ghgIntensity} gCO₂e/MJ</p>
                  <p className="text-gray-700">Target: 89.3368 gCO₂e/MJ (2% below 91.16)</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Route ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GHG Intensity</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">% Difference</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Compliant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {
                        // routes.filter(r => r.routeId !== baseline.routeId).map((route) => {
                        //   const percentDiff = calculatePercentDiff(route.ghgIntensity, baseline.ghgIntensity);
                        //   const isCompliant = calculateCompliance(route.ghgIntensity);

                        //   return (
                        //     <tr key={route.routeId} className="hover:bg-gray-50">
                        //       <td className="px-4 py-3 text-sm font-medium text-gray-900">{route.routeId}</td>
                        //       <td className="px-4 py-3 text-sm text-gray-600">{route.ghgIntensity} gCO₂e/MJ</td>
                        //       <td className={`px-4 py-3 text-sm font-medium ${percentDiff > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        //         {percentDiff > 0 ? '+' : ''}{percentDiff.toFixed(2)}%
                        //       </td>
                        //       <td className="px-4 py-3 text-sm">
                        //         {isCompliant ? (
                        //           <span className="flex items-center gap-1 text-green-600">
                        //             <CheckCircle size={16} /> Yes
                        //           </span>
                        //         ) : (
                        //           <span className="flex items-center gap-1 text-red-600">
                        //             <AlertCircle size={16} /> No
                        //           </span>
                        //         )}
                        //       </td>
                        //     </tr>
                        //   );
                        // })
                        comparison.map((item) => (
                          <tr key={item.routeId}>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.routeId}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.ghgIntensity} gCO₂e/MJ</td>
                            <td className={`px-4 py-3 text-sm font-medium ${item.percentDifference > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {item.percentDifference.toFixed(2)}%
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {item.compliant ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  ✅ Yes
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-red-600">
                                  ❌ No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}


                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                <p className="text-lg">Please set a baseline route first from the Routes tab</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Banking (Article 20)</h2>

            <div className="grid grid-cols-3 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-semibold mb-2 opacity-90">CB Before</h3>
                {/* <p className="text-3xl font-bold">+1,245 tCO₂eq</p>  */}
                {/* <p className="text-3xl font-bold">{cbData?.cbBefore} tCO₂eq</p> */}
                <p className="text-3xl font-bold">
                  {cbData?.cbBefore ?? 0} tCO₂eq
                </p>

              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-semibold mb-2 opacity-90">Applied</h3>
                {/* <p className="text-3xl font-bold">-500 tCO₂eq</p> */}
                {/* <p className="text-3xl font-bold">{cbData?.cbBefore} tCO₂eq</p> */}

                <p className="text-3xl font-bold">
                  {cbData?.applied ?? 0} tCO₂eq
                </p>

              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white p-6 rounded-lg shadow-md">
                <h3 className="text-sm font-semibold mb-2 opacity-90">CB After</h3>
                {/* <p className="text-3xl font-bold">+745 tCO₂eq</p> */}

                <p className="text-3xl font-bold">
                  {cbData?.cbAfter ?? 0} tCO₂eq
                </p>

              </div>
            </div>

            <div className="space-y-4">
              {/* <button
                className="w-full bg-blue-600 cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
                onClick={() => {
                  fetch("http://localhost:4000/api/bank/apply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shipId: "Ship B", cb: 500 }),  // Adjust 500 -> any value you want
                  })
                    .then(() => fetch("http://localhost:4000/api/bank/cb"))
                    .then((res) => res.json())
                    .then((data) => setCbData(data))
                    .catch((err) => console.error("Error applying CB:", err));
                }}
              >
                Bank Positive CB
              </button> */}
              <button
                className="w-full bg-blue-600 cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-all"
                onClick={() => {
                  fetch("http://localhost:4000/api/bank/apply", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shipId: "Ship B", cb: 500 }),
                  })
                    .then(async (res) => {
                      if (!res.ok) {
                        const err = await res.json();
                        toast.error(`❌ ${err.error || "Banking failed"}`);
                        return;
                      }
                      toast.success("✅ Positive CB banked successfully!");
                    })
                    .then(() => fetch("http://localhost:4000/api/bank/cb"))
                    .then((res) => res.json())
                    .then((data) => setCbData(data))
                    .catch(() => toast.error("❌ Error applying CB"));
                }}
              >
                Bank Positive CB
              </button>


              {/* <button className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all">
                Apply Banked Surplus
              </button> */}

              {/* <button
                className="w-full bg-green-600 cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all"
                onClick={() => {
                  fetch("http://localhost:4000/api/bank/surplus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shipId: "Ship B" }),
                  })
                    .then(() => fetch("http://localhost:4000/api/bank/cb"))
                    .then((res) => res.json())
                    .then((data) => setCbData(data))
                    .catch((err) => console.error("Error applying surplus:", err));
                }}
              >
                Apply Banked Surplus
              </button> */}
              <button
                className="w-full bg-green-600 cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all"
                onClick={() => {
                  fetch("http://localhost:4000/api/bank/surplus", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ shipId: "Ship B" }),
                  })
                    .then(async (res) => {
                      if (!res.ok) {
                        const err = await res.json();
                        toast.error(`❌ ${err.error || "Applying surplus failed"}`);
                        return;
                      }
                      toast.success("✅ Surplus applied back to compliance balance!");
                    })
                    .then(() => fetch("http://localhost:4000/api/bank/cb"))
                    .then((res) => res.json())
                    .then((data) => setCbData(data))
                    .catch(() => toast.error("❌ Error applying surplus"));
                }}
              >
                Apply Banked Surplus
              </button>


            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Banking actions are disabled when CB ≤ 0
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pooling' && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Pooling (Article 21)</h2>

            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-4">Pool Members</h3>
              <div className="space-y-3">
                {/* {([
                  { ship: 'Ship A', cbBefore: -500, cbAfter: 0 },
                  { ship: 'Ship B', cbBefore: 1200, cbAfter: 700 },
                  { ship: 'Ship C', cbBefore: -300, cbAfter: 0 }
                ] as PoolMember[]).map((member, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">{member.ship}</span>
                    <div className="flex items-center gap-4">
                      <span className={member.cbBefore < 0 ? 'text-red-600' : 'text-green-600'}>
                        Before: {member.cbBefore} tCO₂eq
                      </span>
                      <ArrowRight size={20} className="text-gray-400" />
                      <span className={member.cbAfter < 0 ? 'text-red-600' : 'text-green-600'}>
                        After: {member.cbAfter} tCO₂eq
                      </span>
                    </div>
                  </div>
                ))} */}
                {poolMembers.length > 0 ? (
                  poolMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">{member.shipId}</span>
                      <div className="flex items-center gap-4">
                        <span className={member.cbBefore < 0 ? "text-red-600" : "text-green-600"}>
                          Before: {member.cbBefore} tCO₂eq
                        </span>
                        <ArrowRight size={20} className="text-gray-400" />
                        <span className={member.cbAfter < 0 ? "text-red-600" : "text-green-600"}>
                          After: {member.cbAfter} tCO₂eq
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No pool created yet</p>
                )}

              </div>
            </div>

            {/* <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
              <p className="font-semibold text-green-800">Pool Sum: +400 tCO₂eq ✓</p>
              <p className="text-sm text-green-700 mt-1">Sum(adjustedCB) ≥ 0 - Pool is valid</p>
            </div> */}

            {poolMembers.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
                <p className="font-semibold text-green-800">
                  Pool Sum: {poolMembers.reduce((acc, m) => acc + m.cbAfter, 0)} tCO₂eq ✓
                </p>
                <p className="text-sm text-green-700 mt-1">Sum(adjustedCB) ≥ 0 - Pool is valid</p>
              </div>
            )}


            {/* <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all">
              Create Pool
            </button> */}
            <button
              className="w-full bg-indigo-600 cursor-pointer text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-all"
              onClick={() => {
                fetch("http://localhost:4000/api/pool/create", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ships: ["Ship A", "Ship B", "Ship C"],
                  }),
                })
                  .then((res) => {
                    if (!res.ok) throw new Error("Pooling failed");
                    toast.success("✅ Pool created successfully!");
                    return fetch("http://localhost:4000/api/pool/members");
                  })
                  .then((res) => res.json())
                  .then((data) => setPoolMembers(data))
                  .catch(() => toast.error("❌ Failed to create pool"));
              }}
            >
              Create Pool
            </button>


          </div>
        )}
      </div>
    </div>
  );
};

export default FuelEUDashboard;