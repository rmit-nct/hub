import React from "react";





const ToDoList= () =>{
    return(
        <div>
            <h3 className="text-xl font-bold mb-4">Tasks</h3>
        <ul className="text-left">
          <li className="mb-2">
            <a href="#" className="text-white font-bold w-full text-left block">Member fee tracking</a>
          </li>
          <li className="mb-2">
            <a href="#" className="text-white font-bold w-full text-left block">Bill tracking</a>
          </li>
          <li>
            <a href="#" className="text-white font-bold w-full text-left block">Budget planning</a>
          </li>
        </ul>
        </div>
    );
}

export default ToDoList;