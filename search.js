module.exports = function(){
    var express = require('express');
    var router = express.Router();
    
    function getAligns(res, mysql, context, complete){
        mysql.pool.query("SELECT DISTINCT creatures.alignment FROM creatures", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.aligns  = results;
            complete();
        });
    }

    function getCreatures(res, mysql, context, id, complete){
        mysql.pool.query("SELECT creatures.creature_id, creatures.name, creatures.health, creatures.alignment, gods.name as god FROM creatures LEFT JOIN gods ON creatures.god_id = gods.god_id WHERE creatures.name <> 'No Owner'AND alignment='" + id + "'", function(error, results, fields){
        //mysql.pool.query("SELECT creatures.name AS name, creatures.alignment as alignment, creatures.health FROM creatures WHERE name <> 'No Owner' AND alignment='" + id + "'", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.creatures = results;
            complete();
        });
    }

    /*Display all alignments, user will select one to filter by. Requires web based javascript to delete users with AJAX*/

    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        //context.jsscripts = ["deletecreature.js"];
        var mysql = req.app.get('mysql');
        getAligns(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('search', context);
            }

        }
    });

    /* Display all of people of specified alignment */

    router.get('/:align', function(req, res){
        callbackCount = 0;
        var context = {};
        var mysql = req.app.get('mysql');
        getCreatures(res, mysql, context, req.params.align, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('search-filter', context);
            }

        }
    });

    router.post('/', function(req, res){
        var string = encodeURIComponent(req.body.align)
        res.redirect('/search/' + string);
    });

    return router;
}();
