module.exports = function(){
    var express = require('express');
    var router = express.Router();

    //console.log("before getgods");
    function getGods(res, mysql, context, complete){
        mysql.pool.query("SELECT gods.god_id, gods.name, gods.origin, gods.god_of FROM gods WHERE god_id <> 6", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.gods  = results;
            complete();
        });
    }

    //console.log("before getgods");
    function getGod(res, mysql, context, id, complete){
        var sql = "SELECT gods.god_id, gods.name, gods.origin, gods.god_of FROM gods WHERE gods.god_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.god = results[0];
            complete();
        });
    }

    /*Display all gods. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletegod.js"];
        var mysql = req.app.get('mysql');
        getGods(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('gods', context);
            }

        }
    });

    /* Display one god for the specific purpose of updating gods */

    router.get('/:god_id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updategod.js"];
        var mysql = req.app.get('mysql');
        getGod(res, mysql, context, req.params.god_id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-god', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO gods (name, origin, god_of) VALUES (?,?,?)";
        var inserts = [req.body.name, req.body.origin, req.body.god_of];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/gods');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:god_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE gods SET name=?, origin=?, god_of=? WHERE god_id=?";
        var inserts = [req.body.name, req.body.origin, req.body.god_of, req.params.god_id];
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

    router.delete('/:god_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM gods WHERE god_id = ?";
        var inserts = [req.params.god_id];
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
