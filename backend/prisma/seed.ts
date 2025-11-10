import prisma from "../src/infrastructure/db/prismaClient";

async function seed() {
  await prisma.poolMember.deleteMany();
  await prisma.pool.deleteMany();
  await prisma.bankEntry.deleteMany();
  await prisma.shipCompliance.deleteMany();
  await prisma.route.deleteMany();

  await prisma.route.createMany({
    data: [
      { routeId: "R001", vesselType: "Container", fuelType: "HFO", year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500 },
      { routeId: "R002", vesselType: "BulkCarrier", fuelType: "LNG", year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200 },
      { routeId: "R003", vesselType: "Tanker", fuelType: "MGO", year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700 },
      { routeId: "R004", vesselType: "RoRo", fuelType: "HFO", year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300 },
      { routeId: "R005", vesselType: "Container", fuelType: "LNG", year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400 }
    ]
  });

  // ✅ Add Ship CB data for Banking and Pooling
  await prisma.shipCompliance.createMany({
    data: [
      { shipId: "Ship A", year: 2025, cb: -500 },
      { shipId: "Ship B", year: 2025, cb: 1200 },  // ✅ Surplus CB
      { shipId: "Ship C", year: 2025, cb: -300 },
    ]
  });

  console.log("✅ Seed completed");
}

seed().finally(() => prisma.$disconnect());
