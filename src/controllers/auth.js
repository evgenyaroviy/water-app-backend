import * as authService from "../services/auth.js";
import { resetPassword } from '../services/auth.js';

const setupSession = (res, data) => {
    res.cookie('refreshToken', data.refreshToken, {
        httpOnly: true,
        expires: data.refreshTokenValidUntil,
    });
    
    res.cookie('sessionId', data._id, {
        httpOnly: true,
        expires: data.refreshTokenValidUntil,
    });
};

export const registerController = async(req, res) => {

    const data = await authService.register(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        data: {
            name: data.name,
            email: data.email
        },});
};


export const loginController = async(req, res) => {
    const data = await authService.login(req.body);
    
    setupSession(res, data);

    res.status(200).json({
        status: 200,
        message: "Successfully logged in a user!",
        data: {
            accessToken: data.accessToken,
        },
    });
};

export const refreshTokenController = async(req, res) => {
    const { refreshToken, sessionId } = req.cookies;
    const data = await authService.refreshToken({refreshToken, sessionId});

    setupSession(res, data);

    res.status(200).json({
        status: 200,
        message: "Successfully refreshed the token!",
        data: {
            accessToken: data.accessToken,
        },
    });
};

export const logoutController = async(req, res) => {
    if (req.cookies.sessionId) {
        await authService.logout(req.cookies.sessionId);
    }
    
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
    
    res.status(204).send();

};

export const requestResetEmailController = async (req, res) => {
  await authService.requestResetToken(req.body.email);
  res.json({
    message: 'Reset password email was successfully sent!',
    status: 200,
    data: {},
  });
};

export const resetPasswordController = async (req, res) => {
  await resetPassword(req.body);
  res.json({
    message: 'Password was successfully reset!',
    status: 200,
    data: {},
  });
};