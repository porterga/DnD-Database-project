module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getFavors(res, mysql, context, complete){
        mysql.pool.query("SELECT creature1.name AS creature_id1, creature2.name AS creature_id2, favor.creature_id1 AS favor1, favor.creature_id2 AS favor2 FROM favor INNER JOIN creatures as creature1 ON creature1.creature_id=favor.creature_id1 INNER JOIN creatures AS creature2 ON creature2.creature_id = favor.creature_id2", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.favors = results;
            complete();
        });
    }
/*
    function getFavors_id(res, mysql, context, complete){
        mysql.pool.query("SELECT favor.creature_id1 AS creature1_id, favor.creature_id2 AS creature2_id FROM favor", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.favors_id = results;
            complete();
        });
    }
*/
    function getCreatures(res, mysql, context, complete){
        mysql.pool.query("SELECT creatures.creature_id, creatures.name FROM creatures WHERE creatures.name <> 'No Owner'", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creatures = results;
            complete();
        });
    }

    function getFavor(res, mysql, context, id, id2, complete){
        var sql = "SELECT favor.creature_id1, favor.creature_id2 FROM favor WHERE favor.creature_id1 = ? AND favor.creature_id2 = ?";
        var inserts = [id, id2];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.favor = results[0];
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletefavor.js"];
        var mysql = req.app.get('mysql');
        //getFavors_id(res, mysql, context, complete);
        getCreatures(res, mysql, context, complete);
        getFavors(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('favors', context);
            }

        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:favor1/:favor2', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedcreature.js", "updatefavor.js"];
        var mysql = req.app.get('mysql');
        getFavor(res, mysql, context, req.params.favor1, req.params.favor2, complete);
        getCreatures(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-favor', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO favor (creature_id1, creature_id2) VALUES (?,?)";
        var inserts = [req.body.creature_id1, req.body.creature_id2];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/favors');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:favor1/:favor2', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE favor SET creature_id1=?, creature_id2=? WHERE creature_id1=? AND creature_id2=?";
        var inserts = [req.body.creature_id1, req.body.creature_id2, req.params.favor1, req.params.favor2];
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

    router.delete('/:favor1/:favor2', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM favor WHERE creature_id1 = ? AND creature_id2 = ?";
        var inserts = [req.params.favor1, req.params.favor2];
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
