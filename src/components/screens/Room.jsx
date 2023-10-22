import React,{useEffect,useCallback, useState} from 'react'
import { useSocket } from '../context/SocketProvider'
import ReactPlayer from 'react-player'
import Peer from '../service/Peer';
export default function Room() {
    const [remoteSocketId,setRemoteSocketId]=useState(null);
    const [mySream,setMyStream]=useState(null);
    const [remoteStream,setRemoteStream]=useState()
    const socket=useSocket();
    
    const handleCallUser=useCallback(async ()=>{
     const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true})
     const offer=await Peer.getOffer();
     console.log(remoteSocketId);
    //  socket.emit("user:call",{to:remoteSocketId,offer}) // actuall code
     socket.emit("user:call",{to:localStorage.getItem("anotherUserSocketId"),offer}) // temprary code

     setMyStream(stream);
    },[])

    const handleUserJoined=useCallback(({email,id})=>{
      console.log("another user joined")
     
      localStorage.setItem("anotherUserSocketId",id); // temprary
     setRemoteSocketId(id);
  },[])

    const handleIncommingCall=useCallback(async({from,offer})=>{
      setRemoteSocketId(from);
      console.log("from-->",from);
      const stream=await navigator.mediaDevices.getUserMedia({audio:true,video:true})
      setMyStream(stream);
      console.log("incommingcall");
      const ans =await Peer.getAnswer(offer)
      console.log("2from-->",from);
      socket.emit('call:accepted',{to:from,ans})
    },[socket])
 
const sendStreams=useCallback(()=>{
  for(const track of mySream.getTracks()){
    Peer.peer.addTrack(track, mySream);
   }
},[mySream])
    const handleCallAccepted=useCallback(({from,ans})=>{
       Peer.setLocalDescription(ans);
       console.log("call accepted")
sendStreams();
    },[sendStreams])
    
    const handleNegoNeedIncomming=useCallback(async({from,offer})=>{
        const ans =await Peer.getAnswer(offer)
        socket.emit("peer:nego:done",{to:from,ans});
    },[socket])
    
    const handleNegotiationneeded=useCallback(async()=>{
      const offer =await Peer.getOffer();
      socket.emit('peer:nego:needed',{offer,to:remoteSocketId})
     },[remoteSocketId,socket])


     const handleNegoFinal=useCallback(async({ans})=>{
      await Peer.setLocalDescription(ans);
     },[])
    useEffect(()=>{
     Peer.peer.addEventListener("negotiationneeded",handleNegotiationneeded)
     return ()=>{
      Peer.peer.removeEventListener("negotiationneeded",handleNegotiationneeded)
     }
    },[handleNegotiationneeded])
    useEffect(()=>{
      Peer.peer.addEventListener("track",async ev =>{
        const remoteStream=ev.streams
        setRemoteStream(remoteStream[0])
      })
    },[])
    useEffect(()=>{
     socket.on("user:joined",handleUserJoined);
     socket.on("incomming:call",handleIncommingCall)
     socket.on("call:accepted",handleCallAccepted);
     socket.on("peer:nego:needed",handleNegoNeedIncomming);
     socket.on("peer:nego:final",handleNegoFinal);
     return ()=>{
        socket.off("user:joined",handleUserJoined);
        socket.off("incomming:call",handleIncommingCall)
        socket.off("call:accepted",handleCallAccepted)
        socket.off("peer:nego:needed",handleNegoNeedIncomming);
        socket.off("peer:nego:final",handleNegoFinal);
     }
    },[socket,handleNegoFinal,handleNegoNeedIncomming,handleCallAccepted,handleUserJoined,handleIncommingCall])
  return (
  <div className="container">
    <h1>Room</h1>
    <h4>{remoteSocketId?"connected":"No one in room"}</h4>
    {mySream&&<button onClick={sendStreams}>send stream</button>}
    {remoteSocketId&&<button onClick={handleCallUser}>CALL</button>}
    <div style={{height:"120%",width:"253%", justifyContent: "center",alignItems:'center'}}>
    {mySream&& <ReactPlayer playing muted height="50%" width="40%" url={mySream}/>}
    {remoteStream&&<ReactPlayer playing muted height="50%" width="40%" url={remoteStream}/>}
    </div>
  </div>
  )
}
