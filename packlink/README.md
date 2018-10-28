#Packlink
Prepare a working, suitable for automation test suite for Packlink test

###Getting Started
These instructions will get you a copy of the project up and running on your local machine for testing purposes. 

### Prerequisites
ChromeDriver 2.43.600229

Create virtualenv python 2.7 and activate it

`virtualenv packlink  `

` source ~/packlink/bin/activate`


###Installing
From path proyect cloned (*~/packlink*)

` python setup.py sdist`
  
` cd dist `

` pip install packlink-0.0.1.tar.gz `

### Running 
From features path (*~/packlink/packlink/features*)

`behave`