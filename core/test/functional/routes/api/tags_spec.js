var testUtils     = require('../../../utils'),
    should        = require('should'),
    supertest     = require('supertest'),
    ghost         = testUtils.startGhost,
    request;

describe('Tag API', function () {
    var accesstoken = '';

    before(function (done) {
        // starting ghost automatically populates the db
        // TODO: prevent db init, and manage bringing up the DB with fixtures ourselves
        ghost().then(function (ghostServer) {
            request = supertest.agent(ghostServer.rootApp);
        }).then(function () {
            return testUtils.doAuth(request, 'posts');
        }).then(function (token) {
            accesstoken = token;
            done();
        }).catch(done);
    });

    after(function (done) {
        testUtils.clearData().then(function () {
            done();
        }).catch(done);
    });

    it('can retrieve all tags', function (done) {
        request.get(testUtils.API.getApiQuery('tags/'))
            .set('Authorization', 'Bearer ' + accesstoken)
            .expect('Content-Type', /json/)
            .expect('Cache-Control', testUtils.cacheRules.private)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }

                should.not.exist(res.headers['x-cache-invalidate']);
                var jsonResponse = res.body;
                should.exist(jsonResponse);
                should.exist(jsonResponse.tags);
                jsonResponse.tags.should.have.length(6);
                testUtils.API.checkResponse(jsonResponse.tags[0], 'tag');
                testUtils.API.isISO8601(jsonResponse.tags[0].created_at).should.be.true();

                done();
            });
    });
});
