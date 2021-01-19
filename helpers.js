const users = [];

const addUser = ({socket_id, name, room_id, user_id})=>{
    const exist = users.find(user=>user.room_id === room_id && user.user_id === user_id)
    
    console.log(users)

    if(exist){
        return ({error: 'User Already exist in this room'});
    }


    const user = {socket_id, name, user_id, room_id};
    users.push(user);
    console.log(`list user` , users);
    return {user};
}

const removeUser = (socket_id)=>{
    const index = users.findIndex(user=> user.socket_id === socket_id);

    if(index){
        return users.splice(index, 1)[0];
    }

}

const getUser = (socket_id)=> users.find(user=> user.socket_id === socket_id);

module.exports = {addUser, removeUser, getUser};