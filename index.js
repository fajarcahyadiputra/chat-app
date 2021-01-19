const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http').createServer(app);
const {addUser, getUser, removeUser} = require('./helpers');
const io = require('socket.io')(http, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;
//import model
const Room = require('./models/Room');
const Message = require('./models/Message');

//for use cookie parser
app.use(cookieParser());

//set cors
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));

//import router
const authRouter = require('./routes/authRoutes');

app.get('/seet-cookie', (req, res)=>{
  res.cookie('username', 'fajarcahyadi');
  res.cookie('isAuthenticated', true, {httpOnly: true, secure: true, maxAge: 24*60*120*120});
  res.send('cookie are set')
})
app.get('/get-cookies', (req, res)=>{
  const cookies = req.cookies;
  console.log(cookies)
  res.json(cookies);
})

//connect to database
mongoose.connect('mongodb://localhost:27017/chat-nodejs',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(()=>{
  console.log('Conect')
}).catch(err=>{
  console.log(err.message)
})


//set data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true})); 


io.on('connection', (socket) => {

  //get rooms from mngodb
  try {
    Room.find()
    .then(room=>{
       socket.emit('data-room', room);
    })
  } catch (error) {
    console.log(error.message)
  }
  //get message from mongodb
  try {
    Message.find()
    .then(message=>{
      socket.emit('data-message', message);
    })
  } catch (error) {
    console.log(error.message)
  }

  socket.on('create-room', name=>{
      const room = Room.create({name}).then((room=>socket.emit('room-created', room)));
  })
  socket.on('join', ({name, room_id, user_id})=>{
      const {error, user} = addUser({
          socket_id: socket.id,
          name,
          room_id,
          user_id
      })

      socket.join(room_id);

      if(error){
          console.log(`join is error ${error}`);
      }else{
          console.log(`join user`, user);
      }

  })

  //receive message
  socket.on('sendMessage', (message, room_id, callback)=>{
    const user = getUser(socket.id);
    const msgToStore = {
      name: user.name,
      user_id: user.user_id,
      room_id,
      text: message
    }

    try {
      const msg = new Message(msgToStore);
      msg.save().then(result=>{
        io.to(room_id).emit('message',  result);
        callback();
      })
    } catch (error) {
      console.log(error.message)
    }

  });

  socket.on('disconnect', ()=>{
    const user = removeUser(socket.id);
  })

});

//use router
app.use('/auth', authRouter);

http.listen(PORT, () => {
  console.log('listening on *:'+PORT);
});