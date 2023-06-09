import express from 'express';
import { PrismaClient } from '@prisma/client';
import passportLocal from 'passport-local';
import passport from 'passport';
import session from 'express-session';

interface IUser {
  id: number;
}

const prisma = new PrismaClient();
const LocalStrategy = passportLocal.Strategy;

const app = express();
app.use(express.json())
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: 'top secret',
  cookie: {
    http: false,
    sameSite: 'strict'
  }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api/todos', (req, res, next) => {
  if (req.isUnauthenticated()) {
    return res.sendStatus(401);
  }

  next();
});

passport.use(new LocalStrategy(async (username, password, done) => {
    const user = await prisma.user.findFirst({
      where: { 
        AND: {
          email: username,
          password
        }
      }
    });

    return done(null, user);
  }
));

passport.serializeUser( async (user: IUser, done) => {
  done(null, user.id);
});

passport.deserializeUser( async (id: number, done) => {
  const user = await prisma.user.findUnique({
    where: { 
     id
    }
  });

  done(null, user);
});

app.post('/api/signin', passport.authenticate('local'), async (req, res) => {
  res.json({
    name: req.user['name']
  })
});

app.post('/api/signout', async (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err)};
    res.sendStatus(204);
  });
  
});

app.get('/api/todos', async ( req, res) => {
  const todos = await prisma.todo.findMany({
    where: {
      userId: req.user['id']
    }
  });
  res.json({todos});
});

app.post('/api/todos', async (req, res) => {
  const { task } = req.body;
  const userId = req.user['id'];
  const todo = await prisma.todo.create({
    data: {
      task,
      completed: false,
      userId
    }
  })

  res.json(todo);
});

app.put('/api/todos/:id', async (req, res) => {
  const id  = parseInt(req.params.id);
  const { task, completed } = req.body;
  const todo = await prisma.todo.update({
    where: { id },
    data: { task, completed }
  });

  res.json(todo);
});

app.delete('/api/todos/:id', async (req, res) => {
  const id  = parseInt(req.params.id);
  await prisma.todo.delete({
    where: { id }
  });

  res.sendStatus(204);
});

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
