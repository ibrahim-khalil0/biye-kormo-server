const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
require('dotenv').config()
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const port = process.env.PORT || 5000

// middleware is here
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bqms9ir.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




// crud operation is here 


// all collection is here 

const totalBiodataCollection = client.db('biodatasDB').collection('totalBiodata')
const totalContactRequestCollection = client.db('biodatasDB').collection('totalContactRequest')
const favoriteBiodataCollection = client.db('biodatasDB').collection('favoriteBiodata')
const paymentsCollection = client.db('biodatasDB').collection('payments')


// all post data is here---------------------



// add new biodata

app.post('/biodata', async(req, res) => {
   const lastBiodataId = await totalBiodataCollection.estimatedDocumentCount()

    const newBiodata = req.body
    newBiodata.biodataId = lastBiodataId + 1
    const result = await totalBiodataCollection.insertOne(newBiodata)
    res.send(result)
})


// send contact request

app.post('/contactRequest', async(req, res) => {
   const contactRequest = req.body
   const result = await totalContactRequestCollection.insertOne(contactRequest)
   res.send(result)
})


// add favorite biodata

app.post('/favorite', async(req, res) => {
   const favorite = req.body
   const result = await favoriteBiodataCollection.insertOne(favorite)
   res.send(result)
})







// all get operation is here ------------------



// get biodata count 
app.get('/totalBiodata', async(req, res) => {
  const totalData = await totalBiodataCollection.estimatedDocumentCount()

  const male = {biodataType: 'Male'}
  const totalMaleData = await totalBiodataCollection.countDocuments(male)

  const female = {biodataType: 'Female'}
  const totalFemaleData = await totalBiodataCollection.countDocuments(female)

  const premium = {isPremium: 'accepted'}
  const totalPremiumData = await totalBiodataCollection.countDocuments(premium)

  const married = {biodataType: 'Married'}
  const totalMarriedData = await totalBiodataCollection.countDocuments(married)

  const result = await paymentsCollection.aggregate([
    {
      $group: {
        _id: null,
        totalPrice: { $sum: '$price' },
      },
    },
  ]).toArray();

  const revenue = result.length > 0 ? result[0].totalPrice : 0;

  const data ={totalData, totalMaleData, totalFemaleData, totalMarriedData, totalPremiumData, revenue}
  res.send(data)
})



// all biodata 
app.get('/allBiodata', async(req, res) => {

  const data = await totalBiodataCollection.find().sort({age: 1}).toArray()
  res.send(data)
})


// get biodata sort by age range 
app.get('/allBiodata/:age', async(req, res) => {

  const age = req.params.age
  const query = {age: {$lte: age}}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})

// get biodata sort by type
app.get('/sortType/:type', async(req, res) => {

  const type = req.params.type
  const query = {biodataType: type}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})


// get biodata sort by only division
app.get('/sortDivision/:division', async(req, res) => {

  const division = req.params.division
  const query = {permanentDivision: division}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})



// get biodata sort by age range and type 
app.get('/allBiodata/:age/:type', async(req, res) => {

  const age = req.params.age
  const type = req.params.type
  const query = {age: {$lte: age}, biodataType: type}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})


// get biodata sort by type and division 
app.get('/typeDivision/:type/:division', async(req, res) => {

  const type = req.params.type
  const division = req.params.division
  const query = {biodataType: type, permanentDivision: division}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})


// get biodata sort by age and division 
app.get('/ageDivision/:age/:division', async(req, res) => {

  const age = req.params.age
  const division = req.params.division
  const query = {age: {$lte: age}, permanentDivision: division}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})


// get biodata sort by age range, division and type 
app.get('/allBiodata/:age/:type/:division', async(req, res) => {

  const age = req.params.age
  const type = req.params.type
  const division = req.params.division
  const query = {age: {$lte: age}, biodataType: type, permanentDivision: division}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).toArray()
  res.send(data)
})







// get all premium biodata 

app.get('/premiumBiodata', async(req, res) => {
  const query = {isPremium: 'accepted'}
  const data = await totalBiodataCollection.find(query).sort({age: 1}).limit(6).toArray()
  res.send(data)
})


// get single user biodata with email

app.get('/biodata/:email', async(req, res) => {
    const email = req.params.email
    const query = {contactEmail : email}
    const data = await totalBiodataCollection.findOne(query)
    res.send(data)
  })



  // get single data with biodata id 

  app.get('/singleData/:id', async(req, res) => {
    const id = parseInt(req.params.id)
    const query = {biodataId : id}
    const data = await totalBiodataCollection.findOne(query)
    res.send(data)
  })



  // get all contact request user sended

  app.get('/contactRequest/:email', async(req, res) => {
    const email = req.params.email
    const query = {requesterEmail : email}
    const data = await totalContactRequestCollection.find(query).toArray()
    res.send(data)
  })



  // get all favorite biodata user added

  app.get('/favorite/:email', async(req, res) => {
    const email = req.params.email
    const query = {userEmail : email}
    const data = await favoriteBiodataCollection.find(query).toArray()
    res.send(data)
  })



// admin dashboard related operation ----

// manage user api 

app.get('/manageUer', async(req, res) => {
  const data = await totalBiodataCollection.find().toArray()
  res.send(data)
})


// pending premium data 

app.get('/approvedPremium', async(req, res) => {
  const query = {isPremium : 'pending'}
  const data = await totalBiodataCollection.find(query).toArray()
  res.send(data)
})


// approved contact request 

app.get('/approvedContact', async(req, res) => {
  const query = {status : 'pending'}
  const data = await totalContactRequestCollection.find(query).toArray()
  res.send(data)
})







  // all update operation is here -------------------


  // update user Biodata

app.put('/updateBiodata/:id', async(req, res) => {
  const id = req.params.id
  const query = {contactEmail: id}

  const options = {upsert: true}
  const biodata = req.body
  const update = {
    $set: {
      name: biodata.name,
      biodataType: biodata.biodataType,
      profileImage: biodata.profileImage,
      dateOfBirth: biodata.dateOfBirth,
      height: biodata.height,
      weight: biodata.weight,
      age: biodata.age,
      occupation: biodata.occupation,
      race: biodata.race,
      fathersName: biodata.fathersName,
      mothersName: biodata.mothersName,
      permanentDivision: biodata.permanentDivision,
      presentDivision: biodata.presentDivision,
      expectedPartnerAge: biodata.expectedPartnerAge,
      expectedPartnerHeight: biodata.expectedPartnerHeight,
      expectedPartnerWeight: biodata.expectedPartnerWeight,
      contactEmail: biodata.contactEmail,
      mobileNumber: biodata.mobileNumber
    }
  }
  const result = await totalBiodataCollection.updateOne(query, update, options)
  res.send(result)
})


// send request for premium biodata 

app.put('/premium/:email', async(req, res) => {
  const email = req.params.email
  console.log(email)
  const query = {contactEmail : email}
  const options = {upsert: true}
  const updatePremium = {
    $set: {
      isPremium: 'pending'
    }
  }
  const result = await totalBiodataCollection.updateOne(query, updatePremium, options)
  res.send(result)
})



// approved premium biodata 

app.put('/approvedPremium/:email', async(req, res) => {
  const email = req.params.email
  const query = {contactEmail : email}
  const options = {upsert: true}
  const updatePremium = {
    $set: {
      isPremium: 'accepted'
    }
  }
  const result = await totalBiodataCollection.updateOne(query, updatePremium, options)
  res.send(result)
})


// make admin 

app.put('/makeAdmin/:email', async(req, res) => {
  const email = req.params.email
  const query = {contactEmail : email}
  const options = {upsert: true}
  const updatePremium = {
    $set: {
      isAdmin: true
    }
  }
  const result = await totalBiodataCollection.updateOne(query, updatePremium, options)
  res.send(result)
})


// approved contact request 

app.put('/approvedContactRequest/:email', async(req, res) => {
  const email = req.params.email
  const query = {_id : email}
  const options = {upsert: true}
  const updatePremium = {
    $set: {
      status: 'approved'
    }
  }
  const result = await totalContactRequestCollection.updateOne(query, updatePremium, options)
  res.send(result)
})



// all delete operation is here -----------------


// delete contact request biodata 

app.delete('/deleteContactRequest/:id', async(req, res) => {
  const id = req.params.id
  const query = {_id: id}

  const result = await totalContactRequestCollection.deleteOne(query)
  res.send(result)
})



// delete favorite biodata 

app.delete('/deleteFavorite/:id', async(req, res) => {
  const id = req.params.id
  const query = {_id: id}

  const result = await favoriteBiodataCollection.deleteOne(query)
  res.send(result)
})




// payment related api ----------------------

app.post('/create-payment-intent', async(req, res) => {
  const {price} = req.body
  const amount = parseInt(price * 100)

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount,
    currency: 'usd',
    payment_method_types: ['card']
  })

  res.send({
    clientSecret: paymentIntent.client_secret
  })
})



app.post('/payments', async(req, res) => {
  const payment = req.body
  const result = await paymentsCollection.insertOne(payment)
  res.send(result)
})


app.get('/revenue', async(req, res) => {
  
  res.send({ totalPrice });
})








app.get('/', (req, res) => {
    res.send('Biye Kormo server is running')
})

app.listen(port, () => {
    console.log(`Server Running on port ${port}`)
})