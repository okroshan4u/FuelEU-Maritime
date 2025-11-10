import { Request, Response } from "express";
import prisma from "../../../infrastructure/db/prismaClient";

const TARGET = 89.3368; // defined target per FuelEU spec

export class CompareController {
  async compare(req: Request, res: Response) {
    // Get baseline route
    const baseline = await prisma.route.findFirst({
      where: { isBaseline: true },
    });

    if (!baseline) {
      return res.status(400).json({ error: "No baseline route set" });
    }

    // Get rest of the routes for comparison
    const comparisonRoutes = await prisma.route.findMany({
      where: { routeId: { not: baseline.routeId } },
    });

    const results = comparisonRoutes.map((route) => ({
      routeId: route.routeId,
      ghgIntensity: route.ghgIntensity,
      percentDifference: ((route.ghgIntensity / baseline.ghgIntensity) - 1) * 100,
      compliant: route.ghgIntensity <= TARGET,
    }));

    res.json({
      baseline: {
        routeId: baseline.routeId,
        baselineIntensity: baseline.ghgIntensity,
        target: TARGET,
      },
      comparison: results,
    });
  }
}
