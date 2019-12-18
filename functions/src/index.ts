import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as bodyParser from "body-parser";


// TODO: test puts


admin.initializeApp(functions.config().firebase);
const db = admin.firestore(); // Add this

const app = express();
const main = express();

const id = require("crypto");

main.use('/api/v1', app);
main.use(bodyParser.json());

export const webApi = functions.https.onRequest(main);

app.get('/health', (request, response) => {

    response.send({status: 'healthy'});

});

app.post('/rsvps', async (request, response) => {
  try {
    const { firstName, 
      lastName,
      weddingID, 
      weddingParty, 
      attending, 
      email, 
      street, 
      zip, 
      state, 
      phone, 
      mealChoice, 
      guest, 
      guestFirstName, 
      guestLastName, 
      mealChoiceGuest } = request.body;

      const invitationCode = (lastName.slice(0,4) + id.randomBytes(2).toString('hex')).toUpperCase();

    const data = {
      firstName,
      lastName,
      weddingID,
      weddingParty,
      attending,
      email,
      street,
      zip,
      state,
      phone,
      mealChoice,
      guest,
      guestFirstName,
      guestLastName,
      mealChoiceGuest
    } 

    const rsvpRef = await db.collection('rsvps').doc(invitationCode).set(data);
    const rsvpResp = await db.collection('rsvps').doc(invitationCode).get();

    response.json({
      id: rsvpResp.id,
      data: rsvpResp.data()
    });

  } catch(error){

    response.status(500).send(error);

  }
});

app.get('/rsvps/:code', async (request, response) => {
  try {
    const invitationCode = request.params.code;

    if (!invitationCode) throw new Error('Invitation code is required');

    const rsvp = await db.collection('rsvps').doc(invitationCode).get();

    if (!rsvp.exists){
        throw new Error('RSVP doesnt exist.')
    }

    response.json({
      id: rsvp.id,
      data: rsvp.data()
    });

  } catch(error){

    response.status(500).send(error);

  }
});

app.get('/rsvps/all', async (request, response) => {
  try {

    const rsvpQuerySnapshot = await db.collection('rsvps').get();
    const rsvps: Object[] = [];
    rsvpQuerySnapshot.forEach(
        (doc) => {
            rsvps.push({
                id: doc.id,
                data: doc.data()
            });
        }
    );

    response.json(rsvps);

  } catch(error){

    response.status(500).send(error);

  }

});

app.put('/rsvps/:id', async (request, response) => {
  try {

    const rsvpId = request.params.id;

    if (!rsvpId) throw new Error('ID is blank');

    const data = request.body;
    const rsvpRef = await db.collection('rsvps')
        .doc(rsvpId)
        .set(data, { merge: true });

    response.json({
        id: rsvpId,
        data
    })


  } catch(error){

    response.status(500).send(error);

  }

});

app.delete('/rsvps/:id', async (request, response) => {
  try {

    const rsvpId = request.params.id;

    if (!rsvpId) throw new Error('ID is blank');

    await db.collection('rsvps')
        .doc(rsvpId)
        .delete();

    response.json({
        id: rsvpId,
    })


  } catch(error){

    response.status(500).send(error);

  }

});

app.post('/wedding', async (request, response) => {
  try {
    const { weddingName, 
      weddingDate,
      weddingLocation, 
      participantOneName, 
      participantTwoName,
      surname,
      hashtag,
      coupleEmail, 
      description, 
      instructions,
      weddingRegistry,
      mealChoiceOne,
      mealChoiceTwo,
      mealChoiceThree } = request.body;

    const weddingCode = (surname.slice(0,4) + id.randomBytes(2).toString('hex')).toUpperCase();

    const data = {
      weddingName, 
      weddingDate,
      weddingLocation, 
      participantOneName, 
      participantTwoName, 
      surname,
      hashtag,
      coupleEmail, 
      description, 
      instructions,
      weddingRegistry,
      'meals': {'mealOne': mealChoiceOne, 'mealTwo': mealChoiceTwo, 'mealThree': mealChoiceThree} 
    } 
    const weddingRef = await db.collection('wedding').doc(weddingCode).set(data);
    const weddingResp = await db.collection('wedding').doc(weddingCode).get();

    response.json({
      id: weddingResp.id,
      data: weddingResp.data()
    });

  } catch(error){

    response.status(500).send(error);

  }
});

app.get('/wedding/:code', async (request, response) => {

   try {

    const weddingCode = request.params.code;

    if (!weddingCode) throw new Error('Wedding code is required');

    const wedding = await db.collection('wedding').doc(weddingCode).get();

    if (!wedding.exists){
        throw new Error('Wedding doesnt exist.')
    }

    response.json({
      id: wedding.id,
      data: wedding.data()
    });

  } catch(error){

    response.status(500).send(error);

  }
});

app.put('/wedding/:code', async (request, response) => {
  try {

    const weddingCode = request.params.code;

    if (!weddingCode) throw new Error('Code is blank');

    const data = request.body;

    const weddingRef = await db.collection('wedding')
        .doc(weddingCode)
        .set(data, { merge: true });

    response.json({
        id: weddingCode,
        data
    })

  } catch(error){

    response.status(500).send(error);

  }

});

