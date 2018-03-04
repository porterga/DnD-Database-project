module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getCreature_Spells(res, mysql, context, complete){
        mysql.pool.query("SELECT creature.name AS creature, spell.name as spell, creature_spells.creature_id as id_c, creature_spells.spell_id as id_s FROM creature_spells INNER JOIN creatures AS creature ON creature.creature_id = creature_spells.creature_id INNER JOIN spells AS spell ON spell.spell_id = creature_spells.spell_id", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creature_spells = results;
            complete();
        });
    }
    
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

    function getSpells(res, mysql, context, complete){
        mysql.pool.query("SELECT spells.spell_id, spells.name FROM spells", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.spells = results;
            complete();
        });
    }

    function getCreature_Spell(res, mysql, context, id, id2, complete){
        var sql = "SELECT creature_spells.creature_id as id_c, creature_spells.spell_id as id_s FROM creature_spells WHERE creature_spells.creature_id = ? AND creature_spells.spell_id = ?";
        var inserts = [id, id2];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creature_spell = results[0];
            complete();
        });
    }

    /*Display all people. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletecreature_spell.js"];
        var mysql = req.app.get('mysql');
        getSpells(res, mysql, context, complete);
        getCreatures(res, mysql, context, complete);
        getCreature_Spells(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('creature_spells', context);
            }

        }
    });

    /* Display one person for the specific purpose of updating people */

    router.get('/:id_c/:id_s', function(req, res){
        console.log("update page");
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["selectedcreature.js", "updatecreature_spell.js", "selectedspell.js"];
        var mysql = req.app.get('mysql');
        getCreature_Spell(res, mysql, context, req.params.id_c, req.params.id_s, complete);
        getSpells(res, mysql, context, complete);
        getCreatures(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 3){
                res.render('update-creature_spell', context);
            }

        }
    });

    /* Adds a person, redirects to the people page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO creature_spells (creature_id, spell_id) VALUES (?,?)";
        var inserts = [req.body.creature_id, req.body.spell_id];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/creature_spells');
            }
        });
    });

    /* The URI that update data is sent to in order to update a person */

    router.put('/:id_c/:id_s', function(req, res){
        console.log(req.params.id_c+","+req.params.id_s+","+req.body.creature_id+","+req.body.name);
        var mysql = req.app.get('mysql');
        var sql = "UPDATE creature_spells SET creature_id=?, spell_id=? WHERE creature_id=? AND spell_id=?";
        var inserts = [req.body.creature_id, req.body.spell_id, req.params.id_c, req.params.id_s];
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

    router.delete('/:id_c/:id_s', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM creature_spells WHERE creature_id = ? AND spell_id = ?";
        var inserts = [req.params.id_c, req.params.id_s];
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
