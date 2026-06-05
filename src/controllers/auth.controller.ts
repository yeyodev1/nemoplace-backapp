import type { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";
import jwt from "jsonwebtoken";
import models from "../models";

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const JWT_EXPIRES_IN = "28d";

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Name, email and password are required." });
      return;
    }

    const existingUser = await models.users.findOne({ email });
    if (existingUser) {
      res.status(HttpStatusCode.Conflict).send({ message: "Email is already registered." });
      return;
    }

    // Automatically create a workspace for the new user
    const workspace = await models.workspaces.create({
      name: `${name}'s Workspace`,
    });

    const user = await models.users.create({
      name,
      email,
      password,
      role: "Owner",
      workspaceId: workspace._id,
    });

    const token = jwt.sign({ userId: user._id, workspaceId: workspace._id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(HttpStatusCode.Created).send({
      message: "User registered successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Email and password are required." });
      return;
    }

    const user = await models.users.findOne({ email });
    if (!user) {
      res.status(HttpStatusCode.Unauthorized).send({ message: "Invalid credentials." });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(HttpStatusCode.Unauthorized).send({ message: "Invalid credentials." });
      return;
    }

    const token = jwt.sign({ userId: user._id, workspaceId: user.workspaceId }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(HttpStatusCode.Ok).send({
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        workspaceId: user.workspaceId,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      res.status(HttpStatusCode.Unauthorized).send({ message: "Not authenticated." });
      return;
    }

    const user = await models.users.findById(userId).select("-password");
    if (!user) {
      res.status(HttpStatusCode.NotFound).send({ message: "User not found." });
      return;
    }

    res.status(HttpStatusCode.Ok).send({
      message: "User retrieved successfully.",
      user,
    });
  } catch (error) {
    next(error);
  }
}
