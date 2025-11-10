import { Router } from "express";
import { RouteController } from "../../adapters/inbound/http/RouteController";
import { CompareController } from "../../adapters/inbound/http/CompareController";
import { BankingController } from "../../adapters/inbound/http/BankingController";
import { PoolingController } from "../../adapters/inbound/http/PoolingController";

const router = Router();

const routeController = new RouteController();
const compareController = new CompareController();
const bankingController = new BankingController();
const poolingController = new PoolingController();

router.get("/routes", (req, res) => routeController.getAllRoutes(req, res));
router.post("/baseline/:routeId", (req, res) => routeController.setBaseline(req, res));

// NEW
router.get("/compare", (req, res) => compareController.compare(req, res));
router.post("/bank/apply", (req, res) => bankingController.applyBanking(req, res));

// ✅ Add this new route
router.get("/bank/cb", (req, res) => bankingController.getCurrentCB(req, res));
router.post("/bank/surplus", (req, res) => bankingController.applySurplus(req, res));

//Pooling tab routes
router.post("/pool/create", (req, res) => poolingController.createPool(req, res));
router.get("/pool/members", (req, res) => poolingController.getPoolMembers(req, res));



export default router;
