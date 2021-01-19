const User = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const maxAge = 5 * 24 * 60 * 60;
//set jwt
const createJWT = id =>{
    return jwt.sign({id}, "chat room secret",{
      expiresIn: maxAge 
    });
  }

const alertError=(err)=>{
let errors = { name:'',email:'', password:''};

if(err.code === 11000){
    errors.email = "this email already register";
    return errors;
}

if(err.message.includes('Users validation failed')){
    Object.values(err.errors).forEach(({properties})=>{
        errors[properties.path] = properties.message
    })

}
return errors;
}

module.exports = {
    signup: async(req, res)=>{
        const {name, email, password} = req.body;
        try {
            await User.create({
                name,
                email,
                password
            }).then(data=>{
                const token = createJWT(data._id);
                res.cookie('jwt', token, {httpOnly: true, makeAge: maxAge * 1000});
                res.status(201).json({user: data})
            })
        } catch (error) {
            let errors = alertError(error);
            res.status(400).json({errors})
        }
    },
    login: async(req, res)=>{
        const {email, password} = req.body;
       try {
        const user = await User.findOne({email: email});
        if(!user){
            return res.status(400).json({status: 'error', message: 'Email is wrong'});
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(400).json({status: 'error', message: 'Password is wrong'});
        }
        const token = createJWT(user._id);
        res.cookie('jwt', token, {httpOnly: true, makeAge: maxAge * 1000});
        res.json({user});
       } catch (error) {
        console.log(error.message);
        return res.status(400).json({status: 'error', message: 'somthing error'});
       }
    },
    logout: async(req, res)=>{
        res.cookie('jwt',"", {makeAge: 1});
        res.status(200).json({logout: true});
    },
    verifyUser:(req, res, next)=>{
        const token = req.cookies.jwt;
        if(token){
            jwt.verify(token, 'chat room secret',async (err, decodedToken)=>{
                console.log('decoded token', decodedToken);
                if(err){
                    console.log(err.message);
                }else{
                    let user = await User.findById(decodedToken.id);
                    res.json(user)
                    next()
                }
                
            })
        }else{
            next();
        }
    }
}