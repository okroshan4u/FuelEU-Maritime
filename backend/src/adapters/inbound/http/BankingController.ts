import { Request, Response } from "express";
import prisma from "../../../infrastructure/db/prismaClient";

export class BankingController {

  // ✅ Step 1: Bank positive CB (move compliance to bank table)
  async applyBanking(req: Request, res: Response) {
    const { shipId, cb } = req.body;

    if (!shipId || cb === undefined) {
      return res.status(400).json({ error: "shipId and cb are required" });
    }

    const current = await prisma.shipCompliance.findFirst({
      where: { shipId },
    });

    if (!current || current.cb <= 0) {
      return res.status(400).json({ error: "No surplus compliance balance to bank" });
    }

    await prisma.bankEntry.create({
      data: {
        shipId,
        year: new Date().getFullYear(),
        amount: cb,
      },
    });

    await prisma.shipCompliance.update({
      where: { id: current.id },
      data: { cb: current.cb - cb },
    });

    res.json({ message: "✅ CB moved to bank successfully" });
  }

  // ✅ Step 2: Apply banked surplus (move bankEntry → shipCompliance)
  async applySurplus(req: Request, res: Response) {
    const { shipId } = req.body;

    const lastBank = await prisma.bankEntry.findFirst({
      where: { shipId },
      orderBy: { id: "desc" },
    });

    if (!lastBank) {
      return res.status(400).json({ error: "No banked surplus found" });
    }

    const current = await prisma.shipCompliance.findFirst({
      where: { shipId },
    });

    await prisma.shipCompliance.update({
      where: { id: current?.id },
      data: { cb: (current?.cb ?? 0) + lastBank.amount },
    });

    res.json({ message: "✅ Banked surplus applied successfully" });
  }

  // ✅ Step 3: Return CB stats for UI cards
  async getCurrentCB(req: Request, res: Response) {
    const shipId = "Ship B"; // hardcoded for now

    const current = await prisma.shipCompliance.findFirst({
      where: { shipId },
    });

    const banked = await prisma.bankEntry.aggregate({
      where: { shipId },
      _sum: { amount: true },
    });

    res.json({
      cbBefore: current?.cb ?? 0,
      applied: banked._sum.amount ?? 0,
      cbAfter: current?.cb ?? 0,
    });
  }
}
