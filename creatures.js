module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getGods(res, mysql, context, complete){
        mysql.pool.query("SELECT gods.god_id, gods.name FROM gods", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.gods  = results;
            complete();
        });
    }

    function getCreatures(res, mysql, context, complete){
        mysql.pool.query("SELECT creatures.creature_id, creatures.name, creatures.health, creatures.alignment, gods.name as god FROM creatures LEFT JOIN gods ON creatures.god_id = gods.god_id WHERE creatures.name <> 'No Owner'", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creatures = results;
            complete();
        });
    }

    function getCreature(res, mysql, context, id, complete){
        var sql = "SELECT creatures.creature_id, creatures.name, creatures.health, creatures.alignment, creatures.god_id FROM creatures WHERE creatures.creature_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creature = results[0];
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecreature.js"];
        var mysql = req.app.get('mysql');
        getCreatures(res, mysql, context, complete);
        getGods(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('creatures', context);
            }

        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:creature_id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedgod.js", "updatecreature.js"];
        var mysql = req.app.get('mysql');
        getCreature(res, mysql, context, req.params.creature_id, complete);
        getGods(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-creature', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO creatures (name, health, god_id, alignment) VALUES (?,?,?,?)";
        var inserts = [req.body.name, req.body.health, req.body.god_id, req.body.alignment];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/creatures');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:creature_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE creatures SET name=?, health=?, god_id=?, alignment=? WHERE creature_id=?";
        var inserts = [req.body.name, req.body.health, req.body.god_id, req.body.alignment, req.params.creature_id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.status(200);
                res.end();
            }
        });
    });

    /* Route to delete a person, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:creature_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM creatures WHERE creature_id = ?";
        var inserts = [req.params.creature_id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();
