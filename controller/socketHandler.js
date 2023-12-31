import { Server } from "socket.io";

import dotenv from 'dotenv'
import { decrypt } from "./video_handler.js";
dotenv.config();
export default function socketScript(server) {
  const emitCounts = {};
  const rooms = {};
  const rateLimitWindowMs = 60 * 1000; // 1 minute
  const rateLimitMaxRequests = 170; // Maximum requests allowed per minute
  const io = new Server(server, {
    cookie: true,
    cors: {
      origin: `${process.env.SERVERURL}:${process.env.port}`, // Replace with your domain
      methods: ['GET', 'POST'],
      credentials: true,

    }
  });

  io.on("connection", async (socket) => {
    try {
      console.log("user connected : " + socket.id);
      disconnectedHandler(socket);
      checkAuthin(socket);
      socket.on('get_data', (info) => {
        try {
          console.log(info);
          console.log(rooms[info]);
          socket.emit('recevid_data', rooms[info]);
        } catch (error) {
          socket.emit('message', { data: `Error:${error.message}`, redirect: false });
        }
      })
      socket.on('removeConnection',()=>{
        disconnectUser(socket);
      })
      videoStatHandler(socket);
      collectReadyHandler(socket);
    } catch (error) {
      console.log('error : ', error.toString());
      socket.emit('message', { data: `Error:${error.message}`, redirect: false });
    }

  });
  const collectReadyHandler = (socket) => {
    socket.on('collect_can_play', (info) => {
      try {
        if (socket.user && socket.user._id) {
          limitRequests(socket.user._id, socket);
          const room = io.sockets.adapter.rooms.get(socket.roomId);
          const numUsersInRoom = room ? room.size : 0;
          io.to(socket.roomId).emit('new_video_stat_check_all_ready', { id: info.id, users: numUsersInRoom });
        } else {
          disconnectUser(socket);
        }
      } catch (error) {
        socket.emit('message', { data: `Error:${error.message}`, redirect: false });
      }
    })
  }
  const limiterHandler = (socket) => {
    if (!emitCounts[socket.user._id]) {
      emitCounts[socket.user._id] = {
        name: socket.user.username,
        count: 0,
        timestamp: Date.now(),
        socketId: socket.id
      };
      addUserTOroom(socket);
    } else {
      io.to(emitCounts[socket.user._id].socketId).emit('message', { data: "You already connected to other room, You will be redirected to home.", redirect: true });
      socket.emit('message', { data: "You already connected to other room, You will be redirected to home.", redirect: true });
      disconnectUser(socket);
      //addUserTOroom(socket);
    }
  }
  const videoStatHandler = (socket) => {
    socket.on('change_video_stat', (info) => {
      try {
        if (!socket.user || !socket.user._id) { disconnectedHandler(socket, "NOT AUTH"); }
        limitRequests(socket.user._id, socket);
        //console.log(info);
        io.to(socket.roomId).emit('new_video_stat', info)
      } catch (error) {
        socket.emit('message', { data: `Error:${error.message}`, redirect: false });
      }
    })
  }
  const disconnectedHandler = (socket, msg) => {
    socket.on('disconnect', () => {
      try {
        console.log('user disconnected');
        updateRoomUser(socket);
        if (socket && socket.roomId) {
          const room = io.sockets.adapter.rooms.get(socket.roomId);
          if (room && room.size <= 0) {
            delete rooms[socket.roomId];
          }
        }
        if (socket.user && socket.user._id && emitCounts[socket.user._id] && emitCounts[socket.user._id].socketId === socket.id) {
          console.log('user data removed');
          delete emitCounts[socket.user._id];
        }
      } catch (error) {
        socket.emit('message', { data: `Error:${error.message}`, redirect: false });
      }
    })
  }


  const addUserTOroom = (socket) => {
    socket.on('add_user_to_room', (info) => {
      try {
        if (socket.user && socket.user._id) {
          limitRequests(socket.user._id, socket);
          if (socket.roomId) { console.log('already connected to room'); return; }
          //console.log(info.data);
          socket.join(info.data);
          socket.roomId = info.data;
          if (!info.guest && info.type) {
            const newdata = { id: info.tmdb_id, season: info.season, episode: info.episode, type: info.type };
            if (!rooms[socket.roomId] || (rooms[socket.roomId].id !== info.id)) {
              io.to(socket.roomId).emit('recevid_data', newdata);
            }
            rooms[socket.roomId] = newdata;
          }
          updateRoomUser(socket);
          console.log('user belong to room ' + socket.roomId);
          socket.emit('room_check', { result: true });
        } else {
          disconnectUser(socket);
        }
      } catch (error) {
        socket.emit('message', { data: `Error:${error.message}`, redirect: false });
      }
    })
  }
  const updateRoomUser = (socket) => {
    try {
      const room = io.sockets.adapter.rooms.get(socket.roomId);
      if (!room) { return; }
      io.to(socket.roomId).emit('update_room_users', {
        data: Array.from(room).map((el) => {
          let userInfo;
          Object.entries(emitCounts).forEach(([key, val]) => {
            if (val && val.socketId === el) {
              userInfo = { id: key, name: val.name };
            }
          })
          if (!userInfo) { return { name: 'unkowen' } }
          return userInfo;
        })
      });
    } catch (error) {
      socket.emit('message', { data: `Error:${error.message}`, redirect: false });
    }
  }
  const checkAuthin = async (socket) => {
    socket.on("Auth_check", (auth) => {
      try {
        //console.log(auth);
        if (!auth.islogedIn) { socket.emit('Auth_check', { result: false }); disconnectUser(socket); return; }
        socket.user = auth.user;
        socket.emit('Auth_check', { result: true });
        limiterHandler(socket);
      } catch (error) {
        socket.emit('message', { data: `Error:${error.message}`, redirect: false });
      }
    })
  }

  const disconnectUser = (socket) => {
    socket.disconnect(true);
  }

  function limitRequests(userId, socket) {
    emitCounts[userId].count++;
    const currentTime = Date.now();
    const elapsedTime = currentTime - emitCounts[userId].timestamp;
    if (elapsedTime <= rateLimitWindowMs && emitCounts[userId].count > rateLimitMaxRequests) {
      socket.emit('message', { data: "You sending too many requests, You will be redirected to home.", redirect: true });
      disconnectUser(socket);
      return;
    }
    if (elapsedTime > rateLimitWindowMs) {
      emitCounts[userId].count = 1;
      emitCounts[userId].timestamp = currentTime;
    }
  }

}


/*
try {
  await checkAuthin(socket);
  const userId = socket.user._id;
  if (!emitCounts[userId]) {
    emitCounts[userId] = {
      count: 0,
      timestamp: Date.now(),
      socketId : socket.id
    };
  }else{
    socket.emit('Message', {error:"You already connected to other room, You will be redirected to home."});
    socket.disconnect(true);
  }
  socket.on('requierData',async (roomId) => {
    try {
      limitRequests(emitCounts, userId, socket);
      await checkAuthin(socket);
      socket.join(decrypt(roomId));
      socket.roomId = decrypt(roomId);
    } catch (error) {
      socket.emit('Message', {error:error.toString()+" , You will be redirected to home."});
      socket.disconnect(true);
    }
  });

  socket.on('updateVideoTime', (data) => {
    try {
      limitRequests(emitCounts, userId, socket);
      io.to(socket.roomId).emit('updateVideoTime', data);
    } catch (error) {
      socket.emit('Message', {error:error.toString()+" , You will be redirected to home."});
      socket.disconnect(true);
    }
  });
  socket.on('disconnect',()=>{
    try {
      if(emitCounts[socket.user._id].socketId === socket.id){
        emitCounts[socket.user._id] = null;
      }
    } catch (error) {
      socket.emit('Message', {error:error.toString()+" , You will be redirected to home."});
    }
  })
  socket.on('canPlay', (data) => {
    try {
      limitRequests(emitCounts, userId, socket);
      isInRoom(socket);
      if(!socket.roomId){return;}
      if (!canPlay[socket.roomId]) { canPlay[socket.roomId] = []; }
      const isExsit = canPlay[socket.roomId].find(v => v === socket.id);
      if (!isExsit) { canPlay[socket.roomId].push(socket.id); }
      const room = io.sockets.adapter.rooms.get(socket.roomId);
      var allExsit = true;
      room.forEach((v) => {
        if (v !== canPlay[socket.roomId].find(e => e === v)) {allExsit = false;}
      })
      if (allExsit) {
        canPlay[socket.roomId].splice(0, canPlay[socket.roomId].length);
        io.to(socket.roomId).emit('allCanPlay', {});
        setTimeout(() => {
          socket.emit('playVideo', data);
        }, 1000)
      }
    } catch (error) {
      socket.emit('Message', {error:error.toString()+" , You will be redirected to home."});
      socket.disconnect(true);
    }
  })
} catch (error) {
  socket.emit('Message', {error:error.toString()+" , You will be redirected to home."});
  socket.disconnect(true);
}
*/