GitHub
------
  - git@github.com:uherting/QRCodeGenerator.git cloned from https://github.com/ranebhushan/QRCodeGenerator

Installation
------------
  - apt install python3-venv (already existed on the machine winnipeg)
  - python3 -m venv /home/uwe/venv/QRCodeGenerator (sets up a virtual environment in the directory /home/uwe/venv/QRCodeGenerator 
      -> for more on virtual environments see https://python.land/virtual-environments/virtualenv )
  - activation of the new venv aka "source /home/uwe/venv/QRCodeGenerator/bin/activate"!!!
  - installation of necessary modules:
    - change into the venv if necessary
    - ecexute on command line:
      - python.exe -m pip install --upgrade pip
      - pip install Pillow qrcode

Usage
-----
  - have a icon ready to be integrated
  - edit the script generateQRcode.py
  - run the script in the venv: "python generateQRcode.py"