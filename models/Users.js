const mongosee = require('mongoose');
const bcrypt = require('bcryptjs');
const {isEmail} = require('validator');

const userShema = new mongosee.Schema({
    name: {
        type: String,
        required: [true, 'please enter a name']
    },
    email: {
        type: String,
        lowercase: true,
        unique: [true, 'email is Duplicat'],
        required: [true, 'please enter a email'],
        validate: [isEmail, 'please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'the password should be at least 6 character long'],
        required: [true, 'please enter a password']
    }
})

userShema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8);
    }
})

module.exports = mongosee.model('Users',userShema);