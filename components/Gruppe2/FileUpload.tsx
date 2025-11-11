'use client'

import { useState } from "react";
 


function uploadFile(file) {
 
  const formData = new FormData();
  formData.append("file", file);
 
  fetch("http://localhost:8000/predict/", {
    method: "POST",
    body: formData
  })
    .then(res => res.json())
    .then(data => console.log("Uploaded:", data))
    .catch(err => console.error(err));
}
export default function FileUpload() {
  const [userFile, setUserFile]=useState<any>(null)
  const handleChange = e => {
    const file = e.target.files[0];
    if (!file) return;
    setUserFile(file)
    //uploadFile(file); //gem den i en sætter i stedet
  };

  return <div>
    <input type="file" onChange={handleChange} aria-label="100" className="bg-gray-500 hover:bg-gray-700 ..." placeholder="Click here to select a file" /> 
    <button className="bg-gray-500 hover:bg-sky-700 ..." variant="outline" onClick={()=>{uploadFile(userFile)}}> Click here to submit</button>
  </div>
}
export {FileUpload}
