import { Request, Response } from "express";
import prisma from "../../../infrastructure/db/prismaClient";

export class PoolingController {

  // ✅ Return existing pool members so frontend can show them
  // async getPoolMembers(req: Request, res: Response) {
  //   const pool = await prisma.pool.findFirst({
  //     orderBy: { id: "desc" },
  //     include: { members: true },
  //   });

  //   if (!pool) {
  //     return res.json([]); // No pool created yet
  //   }

  //   res.json(pool.members);
  // }
  async getPoolMembers(req: Request, res: Response) {
    const pool = await prisma.pool.findFirst({
      orderBy: { id: "desc" },
      include: { members: true },
    });

    res.json(pool?.members || []);
  }


  // ✅ Create a pool and distribute surplus CB (Article 21 logic)
  async createPool(req: Request, res: Response) {
    const { ships } = req.body; // expects: ["Ship A","Ship B","Ship C"]

    if (!ships || ships.length === 0) {
      return res.status(400).json({ error: "Ship list required" });
    }

    // get CB for all ships
    const shipCompliance = await prisma.shipCompliance.findMany({
      where: { shipId: { in: ships } },
    });

    let poolSum = 0;

    for (const ship of shipCompliance) {
      poolSum += ship.cb;
    }

    if (poolSum < 0) {
      return res.status(400).json({ error: "❌ Pool invalid (SUM(cb) must be >= 0)" });
    }

    // create pool first
    const pool = await prisma.pool.create({
      data: {
        year: new Date().getFullYear(),
      },
    });

    // add members to pool
    for (const ship of shipCompliance) {
      await prisma.poolMember.create({
        data: {
          poolId: pool.id,
          shipId: ship.shipId,
          cbBefore: ship.cb,
          cbAfter: poolSum / ships.length, // distribute equally
        },
      });
    }

    res.json({
      message: "✅ Pool created successfully",
      poolId: pool.id,
    });
  }
}
