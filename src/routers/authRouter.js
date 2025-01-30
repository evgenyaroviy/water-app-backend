import { Router } from "express";

import * as authController from "../controllers/auth.js";

import { requestResetEmailController, resetPasswordController } from "../controllers/auth.js";

import { ctrlWrapper } from '../utils/ctrlWrapper.js';

import { validateBody } from "../utils/validateBody.js";

import { authRegisterSchema, authLoginSchema, requestResetEmailSchema, resetPasswordSchema } from "../validation/auth.js";

const authRouter = Router();

authRouter.post('/register', validateBody(authRegisterSchema),ctrlWrapper(authController.registerController));

authRouter.post('/login', validateBody(authLoginSchema), ctrlWrapper(authController.loginController));

authRouter.post('/refresh', ctrlWrapper(authController.refreshTokenController));

authRouter.post('/logout', ctrlWrapper(authController.logoutController));

authRouter.post('/send-reset-email', validateBody(requestResetEmailSchema), ctrlWrapper(requestResetEmailController));

authRouter.post('/reset-pwd', validateBody(resetPasswordSchema), ctrlWrapper(resetPasswordController));


export default authRouter;