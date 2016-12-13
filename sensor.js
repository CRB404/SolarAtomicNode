const Nomad = require('nomad-stream')
const moment = require('moment')
const Particle = require('particle-api-js')

const credentials = require('./particle-login')

const particle = new Particle()
const nomad = new Nomad()

// Particle Device Setup
// Atomic node 1
const deviceID = '340050000851353531343431'

let instance = null
let lastPub = null
let token

const timeBetween = 15 * 1000


function getTime() {
  return new moment()
}

particle.login(credentials)
  .then(res => {
    token = res.body.access_token
    console.log(`Got Token: ${token}`)
    return nomad.prepareToPublish()
  })
  .then((n) => {
    instance = n
    return instance.publishRoot('Hello this is a node monitoring solar output at the IDEO SF studio')
  })
  .then(() => {
    //declaring last publish date
    lastPub = getTime()
    return particle.getEventStream({ deviceId: deviceID, auth: token })
  })
  .then(s => {
    stream = s
    stream.on('event', data => {
      console.log(data)
      // this determines frequency of transmission
      let currentTime = getTime()
      let timeSince = currentTime - lastPub
      console.log(timeSince)
      debugger
      if (timeSince >= timeBetween){

        console.log("***************************************************************************************")

        instance.publish(JSON.stringify(data))
          .catch(err => console.log(`Error: ${JSON.stringify(err)}`))
        lastPub = currentTime

      }
    })
  })
  .catch(err => console.log(`Error: ${JSON.stringify(err)}`))
