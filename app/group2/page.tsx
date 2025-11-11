'use client'

import Image from "next/image";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from 'react';
import Dropzone from 'react-dropzone'
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {FileUpload} from "../../components/Gruppe2/FileUpload.tsx"


export default function Home() {

    return (


        <div
            className="font-sans grid grid-rows-[20px_1fr_20px] items-left justify-items-left min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-1 items-center sm:items-start">
                <h1>This is the app/group2/page.tsx file</h1>
                <h1>Hewwo u.u</h1>
                <h1>here is the upload field</h1>

                <FileUpload/>

                <div>


                    <Dropzone onDrop={acceptedFiles => console.log(acceptedFiles)}>
                        {({getRootProps, getInputProps}) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    <p>Drag and drop file here, or click to select the file</p>

                                </div>
                            </section>
                        )}
                    </Dropzone>
                </div>

                <div className="flex flex-col w-full max-w-sm items-center gap-5">
                    <Input type="text" placeholder="UserName"/>
                    <Input type="text"/>
                </div>
                <Button className="bg-sky-500 hover:bg-sky-700 ..." variant="outline">Button</Button>

            </main>

        </div>
    );
}


