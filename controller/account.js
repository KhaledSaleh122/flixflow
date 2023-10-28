import createHttpError from "http-errors";
import dotenv from 'dotenv'
import { User } from "../model/user.js";
dotenv.config();

export async function createAccount(req, res) {
    try {
        const promise = await new Promise((resolve, reject) => {
            User.register({ username: req.body.username, email: req.body.email,subtitle:req.body.subtitle }, req.body.password, (err, user) => {
                if (err) { reject(err) }
                const {username,email,subtitle,_id} = user;
                resolve({username,email,subtitle,_id});
            })
        })
        res.status(200).json(promise);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export async function loginAccount(req, res) {
    try {
        const user = new User({ username: req.body.username, password: req.body.password });
        const authenticate = User.authenticate();
        const promise = await new Promise((resolve, reject) => {
            authenticate(req.body.username, req.body.password, function (err, result) {
                if (err) { reject(err);return; }
                if (!result) { reject('Username or password is wrong.');return; }
                req.login(user, function (err) {
                    if (err) {reject(err);return;}
                    //const sessionID = req.sessionID;
                    const  {username,email,subtitle,_id} = result;
                    //req.session.passport.user =  {username,email,subtitle,_id} ;
                    //resolve({result : 'loged in successfully.',user_token : sessionID,user:{username,email,subtitle,_id}});
                    resolve({result : 'loged in successfully.',user:{username,email,subtitle,_id}});
                });
            });
        });
        res.status(200).json(promise);
    } catch (err) {
        res.status(500).json({ error: err.toString() });
    }
    return;
}


export async function getAccounts(req,res){
    try {  
        const users = await User.find({},'email username');
        res.status(200).json(users);
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function getAccount(req,res){
    try {  
        const user = await User.findOne({_id:req.params.id},'email username subtitle');
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function isAccountExsit(req,res){
    try {  
        const user = await User.findOne({_id:req.params.id},'email username subtitle');
        if(user){
            res.status(200).json({result:true});
        }else{
            res.status(200).json({result:false});
        }
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return;
}

export async function deleteAccount(req,res){
    try {  
        const user = await User.deleteOne({_id:req.params.id}).exec();
        if(user.deleteCount < 1){throw 'Could not delete account.'}
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return;
}


export async function updateAccount(req,res){
    try {
        const user = await User.updateOne({_id:req.params.id},{email : req.body.email}).exec();
        if(user.matchedCount < 1){throw 'Could not update account.'}
        res.status(200).json(user);
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return;
}
/**
 * 
 * @param {import('express').Request} req 
 * @param {import('express').Response} res 
 */
export async function checkAuth(req,res){
    try{
        if(req.isAuthenticated()){res.status(200).json({ result: true,info:req.user });return}
        res.status(500).json({ result: false });
        /*
        console.log(req.headers.cookie)
        if(req.isAuthenticated()){
            console.log(req.user);
        }
        if(req.body.token){
            req.sessionStore.get(req.body.token, (err, sessionData) => {
                if(err){res.status(500).json({ result: false });}
                if(sessionData && sessionData.passport){
                    console.log(sessionData.passport.user);
                    res.status(200).json({ result: true,info: sessionData.passport.user })
                }
            })
        }else{
            if(req.isAuthenticated()){res.status(200).json({ result: true,info:req.user });return}
            res.status(500).json({ result: false });
        }
        */
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return
}

export async function logout(req,res){
    try{
        const promis = await new Promise((resolve,reject)=>{
            req.logOut(function (err) {
                if (err) {reject(err);return;}
                resolve('done');
            });
        })
        res.status(200).json({ result: promis });
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
    return
}

export async function updateNewPassword(req,res){
    try{
        const authenticate = User.authenticate();
        await new Promise((resolve,reject)=>{
            authenticate(req.body.username, req.body.old, async function (err, result) {
                if (err) { reject(err);return; }
                if (!result) { reject('Old password is wrong');return; }
                try{
                    const userAccount = await User.findById(req.params.id).exec();
                    userAccount.setPassword(req.body.new, async () => {
                        resolve(await userAccount.save());
                    });
                }catch(err){
                    reject(err);return;
                }
            });
        })
        res.status(500).json({ result: "Password updated" });
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
}

export async function takeCredits(req,res){
    try{
        const user = await User.findOne({_id:req.params.id});
        if(user.credit < req.body.amount){throw 'Insufficient funds.'}
        const update = await User.updateOne({_id:req.params.id},{credit : user.credit -  req.body.amount});
        res.status(500).json({ result: "transaction Done" });
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
}


export async function giveCredits(req,res){
    try{
        const user = await User.findOne({_id:req.params.id});
        await User.updateOne({_id:req.params.id},{credit : user.credit +  req.body.amount});
        res.status(500).json({ result: "transaction Done" });
    }catch(err){
        res.status(500).json({ error: err.toString() });
    }
}