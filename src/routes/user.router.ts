import { Router } from "express";
import * as userController from "../controllers/user.controller";

const userRouter = Router();

userRouter.get("/:workspaceId/users", userController.getWorkspaceUsers);
userRouter.post("/:workspaceId/users", userController.inviteUser);
userRouter.put("/:workspaceId/users/:id", userController.updateUser);
userRouter.delete("/:workspaceId/users/:id", userController.deleteUser);

export default userRouter;
