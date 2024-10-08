import "./LeftSidebar.css";
import assets from "../../assets/assets";
import { useNavigate } from "react-router-dom";
import { arrayUnion, collection, doc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../config/firebase";
import { AppContext } from "../../context/AppContext";
import { useContext, useState } from "react";
import { toast } from "react-toastify";

const LeftSidebar = () => {
  const navigate = useNavigate();
  const { userData,chatData } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);

  const inputHandler = async (e) => {
    try {
      const input = e.target.value;
      if (input) {
        setShowSearch(true);
        const userRef = collection(db, "users");
        const q = query(userRef, where("username", "===", input.toLowerCase()));
        const querySnap = await getDocs(q);
        if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
          let userExist = false
          chatData.map((user) =>{
            if(user.rId === querySnap.docs[0].data().id){
              userExist == true;
            }
          })
          if(!userExist){
            setUser(querySnap.docs[0].data());
          }
        } else {
          setUser(null);
        }
      } else {
        setShowSearch(false);
      }
    } catch (error) {
      console.log(error.data)
    }
  };

  const addChat = async () =>{
    const messagesRef = collection(db,"messages");
    const chatsRef = collection(db,"chats");
    try {
      const newMessageRef = doc(messagesRef)
      await setDoc(newMessageRef,{
        createAt:serverTimestamp(),
        messages:[]
      });

      await updateDoc(doc(chatsRef,user.id),{
        chatData:arrayUnion({
          messageId:newMessageRef.id,
          lastMessage:"",
          rId:userData.id,
          updateAt:Date.now(),
          messageSeen:true
        })
      })



      await updateDoc(doc(chatsRef,userData.id),{
        chatData:arrayUnion({
          messageId:newMessageRef.id,
          lastMessage:"",
          rId:user.id,
          updateAt:Date.now(),
          messageSeen:true
        })
      })
    } catch (error) {
      toast.error(error.message)
      console.error(error)
    }
  }

  return (
    <div className="ls">
      <div className="ls-top">
        <div className="ls-nav">
          <img src={assets.logo} className="logo" alt="" />
          <div className="menu">
            <img src={assets.menu_icon} className="" alt="" />
            <div className="sub-menu">
              <p onClick={() => navigate("/profile")}>Edit Profile</p>
              <hr />
              <p>Logout</p>
            </div>
          </div>
        </div>
        <div className="ls-search">
          <img src={assets.search_icon} className="" alt="" />
          <input
            onChange={inputHandler}
            type="text"
            placeholder="Search here.."
          />
        </div>
      </div>
      <div className="ls-list">
        {showSearch && user ? (
          <div onClick={addChat} className="friends add-user">
            <img src={user.avatar} alt="user-avatar" />
            <p>{user.name}</p>
          </div>
        ) : (
          Array(12)
            .fill("")
            .map((item, index) => (
              <div key={index} className="friends">
                <img src={assets.profile_img} className="" alt="" />
                <div className="">
                  <p>Richard Sanford</p>
                  <span>Hello, How are you?</span>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;
