import type { Request, Response, NextFunction } from "express";
import { HttpStatusCode } from "axios";
import models from "../models";
// @ts-ignore
import bcrypt from "bcryptjs";

export async function getWorkspaceUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.params;

    if (!workspaceId) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace ID is required." });
      return;
    }

    const users = await models.users.find({ workspaceId }).select("-password").sort({ createdAt: 1 });

    res.status(HttpStatusCode.Ok).send({
      message: "Workspace users retrieved successfully.",
      users,
    });
  } catch (error) {
    console.error("Error retrieving workspace users:", error);
    next(error);
  }
}

export async function inviteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId } = req.params;
    const { email, role } = req.body;

    if (!workspaceId || !email || !role) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace ID, email, and role are required." });
      return;
    }

    const existingUser = await models.users.findOne({ email });
    if (existingUser) {
      res.status(HttpStatusCode.Conflict).send({ message: "User with this email already exists." });
      return;
    }

    // Default password for invited users since we don't have an email system yet
    const defaultPassword = "password123";
    const name = email.split("@")[0];

    const newUser = await models.users.create({
      name,
      email,
      password: defaultPassword,
      role,
      status: "Activo",
      workspaceId,
    });

    const userObj = newUser.toObject() as any;
    delete userObj.password;

    res.status(HttpStatusCode.Created).send({
      message: "User invited successfully.",
      user: userObj,
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId, id } = req.params;

    if (!workspaceId || !id) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace ID and User ID are required." });
      return;
    }

    const user = await models.users.findOne({ _id: id, workspaceId });
    if (!user) {
      res.status(HttpStatusCode.NotFound).send({ message: "User not found." });
      return;
    }

    if (user.role === "Owner") {
      res.status(HttpStatusCode.Forbidden).send({ message: "Cannot delete the Workspace Owner." });
      return;
    }

    const currentUserId = (req as any).user?.userId;
    if (currentUserId && id === currentUserId) {
      res.status(HttpStatusCode.Forbidden).send({ message: "No puedes eliminar tu propia cuenta." });
      return;
    }

    await models.users.deleteOne({ _id: id });

    res.status(HttpStatusCode.Ok).send({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { workspaceId, id } = req.params;
    const { name, email, phone, role } = req.body;

    if (!workspaceId || !id) {
      res.status(HttpStatusCode.BadRequest).send({ message: "Workspace ID and User ID are required." });
      return;
    }

    const user = await models.users.findOne({ _id: id, workspaceId });
    if (!user) {
      res.status(HttpStatusCode.NotFound).send({ message: "User not found." });
      return;
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phone !== undefined) user.phone = phone; // Allow empty string to clear phone
    
    // Only allow updating the role if they aren't the Owner trying to remove their own ownership, 
    // or if proper permissions are checked (mocked for now).
    if (role && user.role !== "Owner") {
      user.role = role;
    }

    await user.save();

    const userObj = user.toObject() as any;
    delete userObj.password;

    res.status(HttpStatusCode.Ok).send({
      message: "User updated successfully.",
      user: userObj,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    next(error);
  }
}
