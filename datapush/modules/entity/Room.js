/**
 * Created by lkt on 15-4-17.
 */

function Room(name,ho){
    this.users = new Array();
    this.addUser(ho);
    this.ho=ho;
    this.name=name;
    return this;
}
module.exports = Room;

Room.prototype.addUser=function addUser(user){
    this.users.push(user);
}
Room.prototype.removeUser=function removeUser(user){

    var index = this.users.indexOf(user);
    //删除数组中的元素，长度也跟着改变
    this.users.splice(index,1);

}
Room.prototype.setName=function setName(name){
    this.name=name;
}
Room.prototype.getName=function getName(){
    return this.name;
}
Room.prototype.getUsers=function getUsers(){
    return this.users;
}
Room.prototype.setHO=function setHO(ho){
    this.ho=ho;
}
Room.prototype.getHO=function getHO(){
    return this.ho;
}
Room.prototype.userContains=function userContains(user){
    for(var i=0;i<this.users.length;i++){
        if(this.users[i]==user){
            return true;
        }
    }
    return false;

}
