import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import app from '../../api/app';
import {
  firstUser,
  firstUserId,
  invalidUser,
  correctCredentials,
  wrongCredentials,
  secondUser,
  secondUserId,
  notFoundUserId,
  invalidUserId,
  thirdUser,
  modifiedSecondUser,
  failConfPassUser,
  failPassOldUser,
  fourthUser,
} from '../data/users';
import { deleteUsers, createToken } from '../../api/v1/db/seed.test';

chai.use(chaiHttp);

let adminToken = '';
let userToken = '';

before(async () => {
  const result = await deleteUsers();
  userToken = await createToken(secondUser);
  adminToken = await createToken(firstUser);
});

after(async () => {
  await deleteUsers();
});

describe('User accounts', () => {
  describe('POST /auth/signup - User signup', () => {
    it('should sign user up and return a token', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send(thirdUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('data');
          expect(res.body.message).to.be.equal('Signup successful!');
          expect(res).to.be.a.json;
          done();
        });
    });
    it('should not create user if data is invalid', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send(invalidUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          done();
        });
    });
    it('should return error if password confirmation fails', (done) => {
      chai.request(app)
        .post('/api/v1/auth/signup')
        .send(failConfPassUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors.password).to.be.equal('The two passwords do not match');
          done();
        });
    });
  });
  describe('POST /auth/login - User login', () => {
    it('should log user in and return a token', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send(correctCredentials)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal('Sign in successful');
          expect(res).to.be.a.json;
          done();
        });
    });
    it('should return an error if credentials are not valid', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send({ name: 'Bob' })
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          done();
        });
    });
    it('should not log user in if credentials are wrong', (done) => {
      chai.request(app)
        .post('/api/v1/auth/login')
        .send(wrongCredentials)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          expect(res.body.errors.global).to.be.equal('Wrong credentials');
          done();
        });
    });
  });
  describe('POST /auth/logout - User logout', () => {
    it('should log user out', (done) => {
      chai.request(app)
        .get('/api/v1/auth/logout')
        .set('authorization', `token ${userToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.message).to.be.equal('You are now logged out');
          done();
        });
    });
  });
  describe('GET /users - Get all users', () => {
    it('should return all users', (done) => {
      chai.request(app)
        .get('/api/v1/users')
        .set('authorization', `token ${adminToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data.length).to.be.equal(3);
          expect(res.body.message).to.be.equal('success');
          done();
        });
    });
  });
  describe('GET /users/:userId - Get user by ID', () => {
    it('should return a user given the user Id', (done) => {
      chai.request(app)
        .get(`/api/v1/users/${secondUserId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data.username).to.be.equal(secondUser.username);
          expect(res.body.message).to.be.equal('success');
          done();
        });
    });
    it('should return an error message if ID is invalid', (done) => {
      chai.request(app)
        .get(`/api/v1/users/${invalidUserId}`)
        .set('authorization', `token ${userToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.errors.user_id).to.be.equal('A valid user Id is required');
          done();
        });
    });
    it('should return a message if user not found', (done) => {
      chai.request(app)
        .get(`/api/v1/users/${notFoundUserId}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.data.length).to.be.equal(0);
          expect(res.body.message).to.be.equal('User not found');
          done();
        });
    });
  });
  describe('GET /users/:userId/orders - Get user\'s order history', () => {
    it('should return an error message if Id is invalid', (done) => {
      chai.request(app)
        .get(`/api/v1/users/${invalidUserId}/orders`)
        .set('authorization', `token ${userToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.errors.user_id).to.be.equal('A valid user Id is required');
          done();
        });
    });
    it('should return a message if user not found', (done) => {
      chai.request(app)
        .get(`/api/v1/users/${notFoundUserId}/orders`)
        .set('authorization', `token ${userToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(404);
          expect(res.body.message).to.be.equal('User not found');
          done();
        });
    });
  });
  describe('POST /users - Create Admin user', () => {
    it('should create an admin user', (done) => {
      chai.request(app)
        .post('/api/v1/users')
        .set('authorization', `token ${adminToken}`)
        .send(fourthUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(201);
          expect(res.body.data.email).to.be.equal(fourthUser.email);
          expect(res.body.data.role).to.be.equal('admin');
          done();
        });
    });
  });

  describe('PUT /users/:userId - Update user', () => {
    it('should return an error if user ID is invalid', (done) => {
      chai.request(app)
        .put(`/api/v1/users/${invalidUserId}`)
        .set('authorization', `token ${adminToken}`)
        .send(modifiedSecondUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.errors.user_id).to.be.equal('A valid user Id is required');
          done();
        });
    });
    it('should return a message if user not found', (done) => {
      chai.request(app)
        .put(`/api/v1/users/${notFoundUserId}`)
        .set('authorization', `token ${userToken}`)
        .send(modifiedSecondUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.errors.global).to.be.equal('User not found');
          done();
        });
    });
    it('should return an error if old password does not match', (done) => {
      chai.request(app)
        .put(`/api/v1/users/${secondUserId}`)
        .set('authorization', `token ${userToken}`)
        .send(failPassOldUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.errors.passwordOld).to.be.equal('Old password does not match');
          done();
        });
    });
    it('should return an error if user is not valid', (done) => {
      chai.request(app)
        .put(`/api/v1/users/${secondUserId}`)
        .set('authorization', `token ${userToken}`)
        .send(invalidUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body).to.have.property('errors');
          done();
        });
    });
    it('should update a user', (done) => {
      chai.request(app)
        .put(`/api/v1/users/${secondUserId}`)
        .set('authorization', `token ${userToken}`)
        .send(modifiedSecondUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(200);
          expect(res.body.name).to.be.equal(modifiedSecondUser.name);
          done();
        });
    });
  });
  describe('DELETE /users/:userId', () => {
    it('should return an error if ID is invalid', (done) => {
      chai.request(app)
        .delete(`/api/v1/users/${invalidUserId}`)
        .set('authorization', `token ${adminToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(400);
          expect(res.body.errors.user_id).to.be.equal('Invalid user id');
          done();
        });
    });
    it('should delete a user given a user ID', (done) => {
      chai.request(app)
        .delete(`/api/v1/users/${secondUserId}`)
        .set('authorization', `token ${adminToken}`)
        .end((err, res) => {
          if (err) return done(err);
          expect(res).to.have.status(204);
          done();
        });
    });
  });
});
