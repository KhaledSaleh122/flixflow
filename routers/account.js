import express from 'express'
import { isAuthenticatedRequest, isItId, subtitleLanguages, validateResultMiddleware } from './methods.js';
import { body, param, query } from 'express-validator';
import { createAccount, getAccounts, getAccount, loginAccount, deleteAccount, updateAccount, checkAuth, updateNewPassword, logout, takeCredits, giveCredits, isAccountExsit } from '../controller/account.js';
export const accountRouter = express.Router();



accountRouter.post('/signup',
    [
        body('password').isString().isLength({ min: 6, max: 20 }),
        body('username').isString().isLength({ max: 20 }),
        body('email').isEmail(),
        body('subtitle').isString().isIn(subtitleLanguages),
    ], validateResultMiddleware, createAccount);
accountRouter.post('/login',
    [
        body('password').isString().isLength({ min: 6, max: 20 }),
        body('username').isString().isLength({ max: 20 }),
    ], validateResultMiddleware, loginAccount);

accountRouter.get('/', getAccounts);

accountRouter.post('/isAuthinticated', checkAuth)
accountRouter.post('/logout', logout)


accountRouter.get('/:id/', [param('id').exists().isString()], validateResultMiddleware, isItId, getAccount);
accountRouter.get('/find/:id/', [param('id').exists().isString()], validateResultMiddleware, isItId, isAccountExsit);

accountRouter.delete('/:id/', [param('id').exists().isString()],
    validateResultMiddleware, isItId, deleteAccount)

accountRouter.put('/:id/',
    [
        param('id').exists().isString(),
        body('email').exists().isEmail()
    ],
    validateResultMiddleware, isItId, updateAccount);

accountRouter.put('/:id/new-pass',
    [
        param('id').exists().isString(),
        body('old').isString().isLength({ min: 6, max: 20 }),
        body('new').isString().isLength({ min: 6, max: 20 }),
        body('username').isString().isLength({ max: 20 })
    ],
    validateResultMiddleware, isItId, updateNewPassword);



accountRouter.put('/:id/credit/take',
[
    param('id').exists().isString(),
    body('amount').exists().isInt().toInt()
],validateResultMiddleware,isItId,takeCredits);

accountRouter.put('/:id/credit/give',
[
    param('id').exists().isString(),
    body('amount').exists().isInt().toInt()
],validateResultMiddleware,isItId,giveCredits);