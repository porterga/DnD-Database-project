function updateCreature_spell(id, id2){
    $.ajax({
        url: '/creature_spells/' + id + '/' + id2,
        type: 'PUT',
        data: $('#update-creature_spell').serialize(),
        success: function(result){
            window.location.replace("./");
        }
    })
};