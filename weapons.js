module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getCreatures(res, mysql, context, complete){
        mysql.pool.query("SELECT creatures.creature_id, creatures.name FROM creatures", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creatures  = results;
            complete();
        });
    }

    function getWeapons(res, mysql, context, complete){
        mysql.pool.query("SELECT weapons.weapon_id, weapons.name, weapons.damage, creatures.name as owner, weapons.properties FROM weapons LEFT JOIN creatures ON weapons.creature_id = creatures.creature_id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.weapons = results;
            complete();
        });
    }

    function getWeapon(res, mysql, context, id, complete){
        var sql = "SELECT weapons.weapon_id, weapons.name, weapons.damage, weapons.properties, weapons.creature_id FROM weapons WHERE weapons.weapon_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.weapon = results[0];
            complete();
        });
    }

    /*Display all weapons. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteweapon.js"];
        var mysql = req.app.get('mysql');
        getWeapons(res, mysql, context, complete);
        getCreatures(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('weapons', context);
            }

        }
    });

    /* Display one weapon for the specific purpose of updating weapons */

    router.get('/:weapon_id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedcreature.js", "updateweapon.js"];
        var mysql = req.app.get('mysql');
        getWeapon(res, mysql, context, req.params.weapon_id, complete);
        getCreatures(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render('update-weapon', context);
            }

        }
    });

    /* Adds a weapon, redirects to the weapons page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO weapons (name, damage, properties, creature_id) VALUES (?,?,?,?)";
        var inserts = [req.body.name, req.body.damage, req.body.properties, req.body.creature_id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/weapons');
            }
        });
    });

    /* The URI that update data is sent to in order to update a weapon */

    router.put('/:weapon_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE weapons SET name=?, damage=?, properties=?, creature_id=? WHERE weapon_id=?";
        var inserts = [req.body.name, req.body.damage, req.body.properties, req.body.creature_id, req.params.weapon_id];
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

    /* Route to delete a weapon, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:weapon_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM weapons WHERE weapon_id = ?";
        var inserts = [req.params.weapon_id];
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
