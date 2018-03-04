function deleteCreature_spell(id, id2){
    $.ajax({
        url: '/creature_spells/' + id + '/' + id2,
        type: 'DELETE',
        success: function(result){
            window.location.reload(true);
        }
    })
};