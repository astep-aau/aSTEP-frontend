---
title: Project Architecture
description: Project Architecture documentation
---

## Purpose
The purpose of this overview is not to be seen as code documentation, but should be viewed more as a descriptive documentation of the overall software architecture and components part of the solution. 


## Explanation
This project is ordered into several microservices, where each microservice is responsible for its own number of features. Additionally, it uses RabbitMQ as the message broker system of choice, handling the different queues (exchanges) and facilitates communication between the different microservices, keeping a low coupling. Each microservice is moreover organized using vertical slice (with the exception of the training service, using a MVC).

The project consists of the following services:
- State service. Responsible for keeping track of all processes. The state service subscribes to all RabbitMQ message queues (exchanges) to make this happen, but does never consume any messages.
- Translator service. This service is the first and last point of communication between the frontend and backend. It is responsible for creating a process with relevant information, save it to the database and produce an event to a RabbitMQ queue. Additionally, it is responsible for consuming a route estiamted event when everything regarding a process is finished, and sending the response to the frontend using a REST API endpoint.
- Route Estimation service. This service is responsible two key features. 1. Identifying the shortest route from the origin to the destination. 2. Calling the training service to get a time estimate based on the route identified by the A* algorithm.
- Training Service. This service is responsible for estimating how long the given route takes to travel, and making the result available to the route estimation service.
This means that the entire backend consists of different microservice, while the frontend is created using React, TypeScript and JavaScript.


## Workflow
Frontend creates request based on user inputs. Backend receives the request in the translator service. Translator services creates a process and emits an event. The event is consumed by the route estimation service. The route estimation service processes the request and call the training service via an API endpoint. The time is returned to the route estimation service, which emits and event to the exchange. Event consumed by translator service. Frontend poles the backend for response to initial request. When backend is finished data is ready to be displayed in frontend.
- Frontend --> Translator service --> Route estimation service --> Training service --> Route estimation service --> Translator service --> Frontend

