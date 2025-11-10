import { Request, Response } from "express";
import prisma from "../../../infrastructure/db/prismaClient";

export class RouteController {
  // async getAllRoutes(req: Request, res: Response) {
  //   const routes = await prisma.route.findMany();
  //   res.json(routes);
  // }
  async getAllRoutes(req: Request, res: Response) {
    const { vesselType, fuelType, year } = req.query;

    const filters: any = {};

    if (vesselType && vesselType !== "All") filters.vesselType = vesselType;
    if (fuelType && fuelType !== "All") filters.fuelType = fuelType;
    if (year && year !== "All") filters.year = Number(year);

    const routes = await prisma.route.findMany({
      where: filters,
    });

    res.json(routes);
  }


  async setBaseline(req: Request, res: Response) {
    const { routeId } = req.params;

    // Set all to false
    await prisma.route.updateMany({ data: { isBaseline: false } });

    // Set selected route
    await prisma.route.update({
      where: { routeId },
      data: { isBaseline: true }
    });

    res.json({ message: `✅ Baseline set to ${routeId}` });
  }
}
