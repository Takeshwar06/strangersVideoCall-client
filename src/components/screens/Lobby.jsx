import React, { useState,useCallback,useEffect } from 'react'
import { useSocket } from '../context/SocketProvider'
import { useNavigate } from 'react-router-dom'
export default function Lobby() {
    const [email,setEmail]=useState("")
    const [room,setRoom]=useState("")
    const navigate=useNavigate();
    const socket=useSocket();

    const handleSubmit=useCallback((e)=>{
        e.preventDefault();
        socket.emit("room:join",{email,room}); 
        console.log(socket);
    },[email,room,socket])
  

    const handleJoinRoom=useCallback((data)=>{
        const {email,room}=data;
        navigate(`/room/${room}`)
    },[navigate])
   useEffect(()=>{
    socket.on("room:join",handleJoinRoom);
    return ()=>{
        socket.off("room:join",handleJoinRoom)
    }
   },[socket,handleJoinRoom])
  return (
    <div >
      <form action="#" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input type="email" placeholder="Enter Email" id="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <br />
        <label htmlFor="room">Room Id</label>
        <input type="text" placeholder="Enter Room Id"id="room" value={room} onChange={e=>setRoom(e.target.value)} />
        <br />
        <button>Join</button>
      </form>
    </div>
  )
}
