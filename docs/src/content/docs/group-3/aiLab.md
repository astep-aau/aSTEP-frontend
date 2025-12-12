---
title: AI-LAB Server Usage Guide (Training-Service)
description: Documentation for deploying, running, and managing Python & C# services on the AAU AI-LAB cluster.
---

## Purpose
This guide explains how to upload your project, run Python and C# controllers, maintain virtual environments, expose services through SSH tunnels, and manage long-running processes on the AAU AI-LAB cluster.  
It is intended for SW5 Group 3’s *training-service* (Python & C#).

## Explanation
AI-LAB is not a traditional hosting server.  
You do **not** have admin rights (`sudo`, `apt install`), and you must run everything inside your project folder using Python virtual environments or a locally installed .NET SDK.

This guide covers:

- Uploading files into `/ceph/project/SW5-Group3-Astep`
- Running Python FastAPI services (Uvicorn)
- Running C# (.NET) services
- Running both in the background with `nohup`
- Using SSH tunnels to access services
- Managing running processes and logs

---

## Inputs
- Python project folder: `<LOCAL_PATH>/training-service/Python`
- C# project folder: `<LOCAL_PATH>/training-service/C#`
- AI-LAB username: `<AAU_USERNAME>@student.aau.dk`
- AI-LAB hostname: `ailab-fe01.srv.aau.dk`
- Required Python dependencies:
  - `fastapi`, `uvicorn[standard]`, `python-multipart`
  - `torch`, `numpy`, `networkx`, `node2vec`
  - `gensim`, `matplotlib`
- Required .NET SDK installed in `$HOME/.dotnet`

---

## Outputs
- Running Python API on **port 8000**
- Running C# API on **port 5000** (or **8001**, depending on your project)
- Log files in `/logs`:
  - `logs/Python.log`
  - `logs/CSharp.log`
- Reachable via SSH tunnels:
  - Python → `http://localhost:10000`
  - C# → `http://localhost:10001`

---

## Workflow

---

## 1. Upload Project Files to AI-LAB

 Upload entire folders
```bash
scp -r <LOCAL_PATH>/training-service/Python \
<AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/

scp -r <LOCAL_PATH>/training-service/C# \
<AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/
```

Upload a single file
```bash
scp <LOCAL_PATH>/<FILENAME> \
<AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/
```

Upload into a single folder
```bash
scp <LOCAL_PATH>/PythonController.py \
<AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/Python/Controller/
```
Can verify upload on AI-LAB by running:
```bash
ls -lah /ceph/project/SW5-Group3-Astep
```

### 2. Manage files on AI-LAB
Delete file:
```bash
rm -r <PATH>
```
Example:
```bash
rm -r /ceph/project/SW5-Group3-Astep/training-service/Python/Service/Data/FIL
```

Delete folder:
```bash
rm -rf <PATH>
```
Example:
```bash
rm -rf /ceph/project/SW5-Group3-Astep/training-service/Python/Service/Data/FOLDER
```


Move/rename:
```bash
mv <OLD_PATH> <NEW_PATH>
```

Create folder:
```bash
mkdir <NEW_FOLDER>
```

Fix permissions:
```bash
chmod +x <SCRIPT_FILE>
```

Set group for project folder:
```bash
chgrp cs-25-sw-5-03 <FILE_OR_FOLDER>
```

### 3. Upload Project Files
Upload folder to server (run on *local* terminal)
```bash
scp -r <LOCAL_SOURCE_FOLDER> <AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/
```
example:
```bash
scp -r ~/Desktop/Python eskov23@student.aau.dk@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/
```
Download folder from server (run on *local* terminal)
```bash
scp -r <AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/ <LOCAL_DESTINATION>
```
example:
```bash
scp -r eskov23@student.aau.dk@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/ ~/Desktop/TTE-Group-3/
```

Upload a single file: 
```bash
scp <LOCAL_PATH>/<FILENAME> <AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/
```

Upload into a specific folder:
```bash
scp <LOCAL_PATH>/PythonController.py \
<AAU_USERNAME>@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/Python/Controller/
```

can verify upload on AI-LAB by running:
```bash
ls -lah /ceph/project/SW5-Group3-Astep
```

### 4. Create and Activate Python Virtual Environment
Virtual environment must be activated before running the python controller.
```bash
cd /ceph/project/SW5-Group3-Astep/Python
python -m venv .venv
source .venv/bin/activate
pip install fastapi uvicorn[standard] python-multipart torch numpy networkx node2vec gensim matplotlib
```

When virtual environment is activated, it will look like this in terminal:
```bash
(.venv) user@ailab-fe01.srv.aau.dk:/ceph/project/SW5-Group3-Astep/Python
```

### 5. Run Python Controller
Inside:
```bash
/ceph/project/SW5-Group3-Astep/Python/Controller
```

Run the python controller in foreground:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Run the python controller in background using nohup:
```bash
nohup uvicorn PythonController:app --host 0.0.0.0 --port 8000 > ../../logs/Python.log 2>&1 &
```
### 6. Run C# Controller
.NET must be installed inside the project folder, before running the c# controller.
```bash
chmod +x dotnet-install.sh
./dotnet-install.sh --channel STS
```
Add to path:
```bash
export PATH=$HOME/.dotnet:$PATH
```
Inside:
```bash
/ceph/project/SW5-Group3-Astep/C#
```

Run the c# controller in foreground:
```bash
dotnet run --project training-service.csproj
```

Run the c# controller in background using nohup:
```bash
nohup dotnet run > ../logs/CSharp.log 2>&1 &
```
### 7. Create SSH tunnel
From local machine
Using multiple services:
```bash
ssh -L 10000:localhost:8000 -L 10001:localhost:5000 <AAU_USERNAME>@ailab-fe01.srv.aau.dk
```

Now you can access:
- Python: `http://localhost:10000`
- C#: `http://localhost:10001`

### 7. Managing running processes
List running processes:
```bash
ps aux | grep uvicorn
ps aux | grep dotnet
``` 
Stop process:
```bash
kill <process_id>
``` 
force stop process:
```bash
kill -9 <process_id>
```
### 8. View logs
See last 50 lines of log:
```bash
tail -n 50 ../../logs/Python.log
```

Live stream log: 
```bash
tail -f ../../logs/Python.log
```