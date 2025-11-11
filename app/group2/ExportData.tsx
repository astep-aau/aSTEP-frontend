"use client";

import { useState } from "react";
import {FileUploader} from "@components/group2/FileUploader"
import Image from "next/image";

export default function Home() {
  const [responseData, setResponseData] = useState<any>(null);

  // ✅ Full dummy dataset
  //const dummyData = [
   // { id: 0, LCLid: "MAC000002", datetime: "2012-10-12 11:30:00", energy: 0.143, temperature: 13.86, humidity: 0.53 },
  //  { id: 1, LCLid: "MAC000002", datetime: "2012-10-12 12:00:00", energy: 0.663, temperature: 13.86, humidity: 0.53 },
   // { id: 2, LCLid: "MAC000002", datetime: "2012-10-12 12:30:00", energy: 0.256, temperature: 13.99, humidity: 0.53 },
   // { id: 3, LCLid: "MAC000002", datetime: "2012-10-12 13:00:00", energy: 0.155, temperature: 13.99, humidity: 0.53 },
   // { id: 4, LCLid: "MAC000002", datetime: "2012-10-12 13:30:00", energy: 0.199, temperature: 13.52, humidity: 0.55 },
  //  { id: 5, LCLid: "MAC000002", datetime: "2012-10-12 14:00:00", energy: 0.125, temperature: 13.52, humidity: 0.55 },
  //  { id: 6, LCLid: "MAC000002", datetime: "2012-10-12 14:30:00", energy: 0.165, temperature: 12.69, humidity: 0.62 },
   // { id: 7, LCLid: "MAC000002", datetime: "2012-10-12 15:00:00", energy: 0.14, temperature: 12.69, humidity: 0.62 },
  //  { id: 8, LCLid: "MAC000002", datetime: "2012-10-12 15:30:00", energy: 0.148, temperature: 12.46, humidity: 0.55 },
  //  { id: 9, LCLid: "MAC000002", datetime: "2012-10-12 16:00:00", energy: 0.154, temperature: 12.46, humidity: 0.55 },
   // { id: 10, LCLid: "MAC000002", datetime: "2012-10-12 16:30:00", energy: 0.137, temperature: 11.31, humidity: 0.62 },
 //  { id: 11, LCLid: "MAC000002", datetime: "2012-10-12 17:00:00", energy: 0.493, temperature: 11.31, humidity: 0.62 },
 //   { id: 12, LCLid: "MAC000002", datetime: "2012-10-12 17:30:00", energy: 0.354, temperature: 10.39, humidity: 0.7 },
  //  { id: 13, LCLid: "MAC000002", datetime: "2012-10-12 18:00:00", energy: 0.228, temperature: 10.39, humidity: 0.7 },
  //  { id: 14, LCLid: "MAC000002", datetime: "2012-10-12 18:30:00", energy: 0.195, temperature: 9.38, humidity: 0.75 },
   // { id: 15, LCLid: "MAC000002", datetime: "2012-10-12 19:00:00", energy: 0.527, temperature: 9.38, humidity: 0.75 },
    //{ id: 16, LCLid: "MAC000002", datetime: "2012-10-12 19:30:00", energy: 0.886, temperature: 8.93, humidity: 0.78 },
    //{ id: 17, LCLid: "MAC000002", datetime: "2012-10-12 20:00:00", energy: 0.198, temperature: 8.93, humidity: 0.78 },
   // { id: 18, LCLid: "MAC000002", datetime: "2012-10-12 20:30:00", energy: 0.243, temperature: 8.93, humidity: 0.78 },
   // { id: 19, LCLid: "MAC000002", datetime: "2012-10-12 21:00:00", energy: 0.193, temperature: 8.93, humidity: 0.78 },
   // { id: 20, LCLid: "MAC000002", datetime: "2012-10-12 21:30:00", energy: 0.342, temperature: 8.51, humidity: 0.82 },
  //  { id: 21, LCLid: "MAC000002", datetime: "2012-10-12 22:00:00", energy: 0.27, temperature: 8.51, humidity: 0.82 },
   // { id: 22, LCLid: "MAC000002", datetime: "2012-10-12 22:30:00", energy: 0.325, temperature: 8.97, humidity: 0.81 },
  //  { id: 23, LCLid: "MAC000002", datetime: "2012-10-12 23:00:00", energy: 0.269, temperature: 8.97, humidity: 0.81 },
   // { id: 24, LCLid: "MAC000002", datetime: "2012-10-12 23:30:00", energy: 0.29, temperature: 8.78, humidity: 0.84 },
  //];

  

  //const sendPostRequest = async () => {
   // try {
     // const res = await fetch("http://localhost:8000/predict/", {
     //   method: "POST",
     //   headers: { "Content-Type": "application/json" },
     //   body: JSON.stringify({ data: dummyData }),
     // });

     // if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
     // const data = await res.json();
     // setResponseData(data);
     // console.log("Server response:", data);
    //} catch (err) {
    //  console.error("Error:", err);
   // }
 // };



 //let ActualData=[ListOfId, ListOfLCLID, ListOfDates,ListOfTime,ListOfEnergy,ListOfTemperature, ListOfHumidity];

 

  const sendPostRequest_ForActualData = async () => {
    try {
        const res = await fetch("http://localhost:8000/predict/", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({data: ActualData}),
        });

    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
    const data = await res.json();
    setResponseData(data);
    console.log("Server response:", data);
    } catch (err) {
      console.error("Error:", err);
  }
  };

  function uploadFile = () {
    const formData=new FormData()
    formData.append("file", file);

    fetch("http://localhost:8000/predict/", {
      method: "POST",
      body: formData
    })
    .then(res=>res.json())
    .then(data=>console.log("Uploaded:", data))
    .catch(err=>console.error(err));
  } 
  export default const fileUpload() {
    const handleChange=e=>{
      const file = e.target.files[0];
      if (!file) return;
      uploadFile(file);
    };
    return <input type="file" onChange={handleChange} />;
  }


  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1>This is the app/group2/page.tsx file</h1>

        {/* Button */}
        <button
          onClick={sendPostRequest}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Send POST Request
        </button>



        {/* Display server response */}
        {responseData && (
          <div className="mt-4 w-full">
            <h2>Response:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              {JSON.stringify(responseData, null, 2)}
            </pre>
          </div>
        )}
      </main>
    </div>
  );
}