module.exports = function(){
    var express = require('express');
    var router = express.Router();

    function getSpells(res, mysql, context, complete){
        mysql.pool.query("SELECT spells.spell_id, spells.name, spells.level, spells.description, spells.components FROM spells", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.spells  = results;
            complete();
        });
    }

    function getSpell(res, mysql, context, id, complete){
        var sql = "SELECT spells.spell_id, spells.name, spells.level, spells.description, spells.components FROM spells WHERE spells.spell_id = ?";
        var inserts = [id];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.spell = results[0];
            complete();
        });
    }

    /*Display all spells. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deletespell.js"];
        var mysql = req.app.get('mysql');
        getSpells(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('spells', context);
            }

        }
    });

    /* Display one spell for the specific purpose of updating spells */

    router.get('/:spell_id', function(req, res){
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updatespell.js"];
        var mysql = req.app.get('mysql');
        getSpell(res, mysql, context, req.params.spell_id, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('update-spell', context);
            }

        }
    });

    /* Adds a spell, redirects to the spell page after adding */

    router.post('/', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO spells (name, level, description, components) VALUES (?,?,?,?)";
        var inserts = [req.body.name, req.body.level, req.body.description, req.body.components];
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/spells');
            }
        });
    });

    /* The URI that update data is sent to in order to update a spell */

    router.put('/:spell_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "UPDATE spells SET name=?, level=?, description=?, components=? WHERE spell_id=?";
        var inserts = [req.body.name, req.body.level, req.body.description, req.body.components, req.params.spell_id];
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

    /* Route to delete a spell, simply returns a 202 upon success. Ajax will handle this. */

    router.delete('/:spell_id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM spells WHERE spell_id = ?";
        var inserts = [req.params.spell_id];
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
