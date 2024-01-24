


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const app = express();
require('dotenv').config();
var jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcrypt');
const port = process.env.PORT || 5000;

//  
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shgmdrc.mongodb.net/?retryWrites=true&w=majority`;

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

    const userCollection = client.db('houseHunterDb').collection('users');
    const houseCollection = client.db('houseHunterDb').collection('houses');
    const bookingCollection = client.db('houseHunterDb').collection('booking');

 // Register User
 app.post('/register', async (req, res) => {
    try {
        const {name, role, phoneNumber, email, password} = req.body;
        // check the email already exists
        console.log(req.body)
        const existingUser = await userCollection.findOne({email: email});
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered'})
        }
        // hash the password
        // const hashedPassword = await bcrypt.hash(password, 10);

        // new user create
        const newUser = {
            name,
            role,
            phoneNumber,
            email,
            password,
        };
        // Insert user into database
       const result = await userCollection.insertOne(newUser);
        
        res.status(201).json(result);
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error'});
    }
 });

 // get houses from database
 app.get('/houses', async (req, res) => {
       const result = await houseCollection.find().toArray();
        res.status(201).json(result);
 });

 // Add houses to database
 app.post('/add-houses', async (req, res) => {
    try {
        const {name, address,city,bedrooms, bathrooms, roomSize,rentPerMonth, phoneNumber, availabilityDate, description, owner, picture} = req.body;
        
        console.log(req.body)
       
        // new user create
        const newHouse = {name, address,city,bedrooms, bathrooms, roomSize,rentPerMonth, phoneNumber, availabilityDate, description, owner, picture};
        // Insert user into database
       const result = await houseCollection.insertOne(newHouse);
        
        res.status(201).json(result);
    }catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error'});
    }
 });

   //Update house
   app.put('/houses/:id', async (req, res) => {
    const id = req.params.id;
    const {name, address,city,bedrooms, bathrooms, roomSize,rentPerMonth, phoneNumber, availabilityDate, description, owner, picture} = req.body;

    const filter = { _id:new ObjectId(id) }
    const options = { upsert: true }
    const updatedHouse = {
      $set: {
        name,
        address,
        city,
        bedrooms,
        bathrooms,
        roomSize,
        rentPerMonth,
        phoneNumber, 
        availabilityDate, 
        description, 
        owner,
        picture
      }

    }
    const result = await houseCollection.updateOne(filter, updatedHouse, options);
    console.log(result)
    res.send(result);

  })

  // delete house for owner
   app.delete('/houses/:id', async (req, res) => {

    const id = req.params.id;
    console.log(id)
    const filter = { _id:new ObjectId(id) }
    const result = await houseCollection.deleteOne(filter);
    console.log(result)
    res.send(result);

  })


  // book a house 
   app.post('/booking', async (req, res) => {
    try {
        const {renterName,renterEmail,renterPhoneNumber,houseId} = req.body;
        console.log(req.body)

        const filter = { renterEmail: renterEmail}
        const previousBooking = await bookingCollection.find(filter).toArray()
        console.log(previousBooking.length)

        if (previousBooking.length >= 2) {
          return res.send('You can book a maximum of two houses');
      }

        const houseFilter = { _id:new ObjectId(houseId) }
        const bookingHouse = await houseCollection.findOne(houseFilter)

        if (!bookingHouse) {
          return res.status(404).json({ message: 'House not found' });
      }

      const newBooking = { renterName,renterEmail, renterPhoneNumber, houseId, house: bookingHouse}
      const result = await bookingCollection.insertOne(newBooking)
      res.status(201).json(result);

    }catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error'});
    }
 });

 // get booking list for specific renter
 app.get('/booking', async (req, res) => {
  const renterEmail = req.query.email
  // console.log(renterEmail)
  const filter = {renterEmail: renterEmail}

  const result = await bookingCollection.find(filter).toArray();
   res.status(201).json(result);
});

 // delete booking list for specific renter
 app.delete('/booking/:id', async (req, res) => {
  const id = req.params
  console.log(id)
  const filter = { _id:new ObjectId(id) }

  const result = await bookingCollection.deleteOne(filter);
   res.status(201).json(result);
});




    // Send a ping to confirm a successful connection

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();

   
  }
}
run().catch(console.dir);

// Register User
app.post('/users')

app.get('/', (req, res) => {
    res.send('House Hunter is running')
})

app.listen(port, () => {
    console.log(`House Hunter is running on port, ${port}`)
})






















// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');


// const app = express();
// const port = process.env.PORT || 5000;
// const cors = require('cors');

// // middleware
// app.use(cors());
// app.use(express.json());


// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shgmdrc.mongodb.net/?retryWrites=true&w=majority`;
// mongoose.connect(uri)

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// app.use(bodyParser.json());

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const userCollection = client.db('usersDB').collection('users');

//     app.get('/users', async( req, res) => {
//         const cursor = userCollection.find()
//         const result = await cursor.toArray();
//         res.send(result);
//     })

//     app.get('/users/:id', async(req, res) => {
//         const id = req.params.id;
//         const query = {_id: new ObjectId(id)}
//         const user = await userCollection.findOne(query);
//         res.send(user);
//     })

//     app.post('/users', async(req, res) => {
//         const user = req.body;
//         console.log('new user', user);
//         const result = await userCollection.insertOne(user);
//         res.send(result);
//     });

//     app.put('/users/:id', async(req, res) =>{
//         const id = req.params.id;
//         const user = req.body;
//         console.log(id, user);
        
//         const filter = {_id: new ObjectId(id)}
//         const options = {upsert: true}
//         const updatedUser = {
//             $set: {
//                 name: user.name,
//                 email: user.email
//             }
//         }

//         const result = await userCollection.updateOne(filter, updatedUser, options );
//         res.send(result);

//     })

//     app.delete('/users/:id', async(req, res) =>{
//         const id = req.params.id;
//         console.log('please delete from database', id);
//         const query = { _id: new ObjectId(id)}
        
//         const result = await userCollection.deleteOne(query);
//         res.send(result);
//     })


//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     // await client.close();
//   }
// }
// run().catch(console.dir);



// app.get('/', (req, res) =>{
//     res.send('SIMPLE CRUD IS RUNNING')
// })

// app.listen(port, () =>{
//     console.log(`SIMPLE CRUD is running on port, ${port}`)
// })



// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const app = express();
// const port = process.env.PORT || 5000;
// const cors = require('cors');

// // middleware
// app.use(cors());
// app.use(express.json());

// // Connect to MongoDB using Mongoose
// mongoose.connect(`mongodb+srv://houseHunter:cX8UZabLLmPiIFWJ@cluster0.shgmdrc.mongodb.net/houseHunterDB`);

// // Define a user schema
// const userSchema = new mongoose.Schema({
//   name: String,
//   role: String,
//   phoneNumber: String,
//   email: String,
//   password: String,
// });

// // Create a User model based on the schema
// const User = mongoose.model('User', userSchema);

// app.use(bodyParser.json());

// // Register User
// app.post('/register', async (req, res) => {
//   try {
//     const { name, role, phoneNumber, email, password } = req.body;

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User already exists' });
//     }

//     // Hash password
//     // const hashedPassword = await bcrypt.hashSync(password, 12);

//     // Save user to the database
//     const user = new User({ name, role, phoneNumber, email, password });
//     await user.save();

//     res.status(201).json({ message: 'User registered successfully' });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });


// // Login User
// app.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid Email' });
//     }

//     // Compare hashed passwords
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ message: 'Invalid Password' });
//     }

//     // Create JWT token
//     const token = jwt.sign({ userId: user._id, email: user.email }, 'your_secret_key', { expiresIn: '1h' });

//     res.status(200).json({ token });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// });










// app.get('/users/:id', async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     res.send(user);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// app.post('/users', async (req, res) => {
//   try {
//     const user = new User(req.body);
//     const result = await user.save();
//     res.send(result);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// app.put('/users/:id', async (req, res) => {
//   try {
//     const result = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.send(result);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// app.delete('/users/:id', async (req, res) => {
//   try {
//     const result = await User.findByIdAndDelete(req.params.id);
//     res.send(result);
//   } catch (error) {
//     res.status(500).send(error.message);
//   }
// });

// app.get('/', (req, res) => {
//   res.send('SIMPLE CRUD IS RUNNING');
// });


// // Event listeners for connection status
// const db = mongoose.connection;

// // Successful connection
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });




// app.listen(port, () => {
//   console.log(`SIMPLE CRUD is running on port, ${port}`);
// });
