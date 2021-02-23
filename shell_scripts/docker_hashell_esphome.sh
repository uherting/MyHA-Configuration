#!/bin/bash

docker exec -it `docker ps | grep esphome | cut -f 1 -d " "` bash
