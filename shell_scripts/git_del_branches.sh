#!/bin/bash

git branch | \
  grep -v "master" | \
  xargs git branch -D
