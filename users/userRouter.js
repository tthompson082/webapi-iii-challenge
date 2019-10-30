const express = require('express');

const router = express.Router();

const Users = require('./userDb');
const Posts = require('../posts/postDb');

router.post('/', validateUser, (req, res) => {
  const newUser = req.body;

  Users.insert(newUser)
    .then(user => {
      Users.getById(user.id)
        .then(retrievedUser => {
          res.status(201).json(retrievedUser);
        })
        .catch(error => {
          res.status(500).json({
            message: 'There was an error returning the newly created user'
          });
        });
    })
    .catch(err => {
      res.status(500).json({ message: 'There was an error adding a new user' });
    });
});

router.post('/:id/posts', validateUserId, validatePost, (req, res) => {
  const id = req.params.id;
  const newPost = { ...req.body, user_id: id };

  Posts.insert(newPost)
    .then(post => {
      Posts.getById(post.id)
        .then(retrievedPost => {
          res.status(201).json(retrievedPost);
        })
        .catch(error => {
          res
            .status(500)
            .json({ message: 'There was an error retrieving the new post' });
        });
    })
    .catch(err => {
      res.status(500).json({ message: 'There was an error adding a new post' });
    });
});

router.get('/', (req, res) => {
  Users.get()
    .then(allUsers => {
      res.status(200).json(allUsers);
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: 'There was an error retrieving the users' });
    });
});

router.get('/:id', validateUserId, (req, res) => {
  res.status(200).json(req.user);
});

router.get('/:id/posts', validateUserId, (req, res) => {
  const id = req.params.id;

  Users.getUserPosts(id)
    .then(userPosts => {
      res.status(200).json(userPosts);
    })
    .catch(err => {
      res
        .status(500)
        .json({ message: "There was an error retrieving the user's posts" });
    });
});

router.delete('/:id', validateUserId, (req, res) => {
  const id = req.params.id;

  Users.remove(id)
    .then(removed => {
      res.status(200).json({ message: `${removed} user removed.` });
    })
    .catch(err => {
      res.status(500).json({ message: 'There was an error removing the user' });
    });
});

router.put('/:id', validateUserId, validateUser, (req, res) => {
  const id = req.params.id;
  const info = req.body;

  Users.update(id, info)
    .then(x => {
      Users.getById(id).then(updatedUser => {
        res.status(200).json(updatedUser);
      });
    })
    .catch(err => {
      res.status(500).json({ message: 'There was an error updating the user' });
    });
});

//custom middleware

function validateUserId(req, res, next) {
  const id = req.params.id;

  Users.getById(id)
    .then(user => {
      if (!user) {
        res.status(400).json({ message: 'invalid user id' });
      } else {
        req.user = user;
        next();
      }
    })
    .catch(err => {
      res.status(500).json({ message: 'There was an error' });
    });
}

function validateUser(req, res, next) {
  const info = req.body;
  if (Object.keys(info).length === 0) {
    res.status(400).json({ message: 'missing user data' });
  } else if (!info.name) {
    res.status(400).json({ message: 'missing required name field' });
  } else {
    next();
  }
}

function validatePost(req, res, next) {
  const info = req.body;
  if (Object.keys(info).length === 0) {
    res.status(400).json({ message: 'missing post data' });
  } else if (!info.text) {
    res.status(400).json({ message: 'missing required text field' });
  } else {
    next();
  }
}

module.exports = router;
